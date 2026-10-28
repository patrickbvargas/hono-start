import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Prisma } from "@/generated/prisma/client";

const { queryRaw } = vi.hoisted(() => ({ queryRaw: vi.fn() }));
vi.mock("@/shared/lib/prisma", () => ({ prisma: { $queryRaw: queryRaw } }));

import { getPendingWork } from "../data/queries";
import { pendingWorkSearchSchema } from "../schemas/search";

const search = pendingWorkSearchSchema.parse({});
const scope = {
	firmId: 7,
	allContracts: true,
	allFees: true,
	assignedFees: false,
};
const result = {
	data: [],
	total: 0,
	high: 0,
	medium: 0,
	low: 0,
	contracts: 0,
	page: 1,
	pageSize: 25,
};

describe("pending work data boundary", () => {
	it("joins global clients without a removed firm column and retains operational scope", async () => {
		await getPendingWork({ scope, search });
		const sql: Prisma.Sql = queryRaw.mock.calls[0][0];
		expect(sql.text).toContain('JOIN clients cl ON cl.id = c."clientId"');
		expect(sql.text).not.toContain('cl."firmId"');
		expect(sql.text).toContain('WHERE c."firmId" =');
		expect(sql.values).toContain(scope.firmId);
	});
	it("intersects related client and employee IDs with the viewer's assignment visibility", async () => {
		await getPendingWork({
			scope: {
				...scope,
				allContracts: false,
				allFees: false,
				assignedFees: true,
				employeeId: 9,
			},
			search: { ...search, clientId: "42", employeeId: "23", limit: 5 },
		});
		const sql: Prisma.Sql = queryRaw.mock.calls[0][0];
		expect(sql.values).toEqual(expect.arrayContaining([9, "42", "23", 5]));
		expect(sql.text).toContain('c."clientId"::text');
		expect(sql.text).toContain('a."employeeId"::text');
		expect(sql.text).toContain("c.financial");
	});
	it("orders the complete query and JSON page consistently with a stable tiebreaker", async () => {
		await getPendingWork({
			scope,
			search: { ...search, column: "processNumber", direction: "desc" },
		});
		const sql: Prisma.Sql = queryRaw.mock.calls[0][0];
		expect(
			sql.text.match(/ORDER BY "processNumber" DESC NULLS LAST/g),
		).toHaveLength(2);
		expect(sql.text).toContain('"contractId", id');
	});
	beforeEach(() => {
		queryRaw.mockReset();
		queryRaw.mockResolvedValue([{ result }]);
	});
	it("uses a single parameterized statement for pagination and filtered totals", async () => {
		const text = "' OR true --";
		await expect(
			getPendingWork({
				scope,
				search: { ...search, query: text, page: 3 },
				today: "2026-10-24",
			}),
		).resolves.toEqual(result);
		expect(queryRaw).toHaveBeenCalledTimes(1);
		const sql: Prisma.Sql = queryRaw.mock.calls[0][0];
		expect(sql.text).not.toContain(text);
		expect(sql.values).toContain(text);
		expect(sql.values).toContain(50);
		expect(sql.text).toContain("FROM filtered");
		expect(sql.text).toContain('count(DISTINCT "contractId")');
		expect(sql.text).toContain('NULLS LAST, "contractId", id');
	});
	it("keeps contract visibility and financial assignment scopes independent", async () => {
		await getPendingWork({
			scope: { ...scope, employeeId: 9, allFees: false, assignedFees: true },
			search,
		});
		const sql: Prisma.Sql = queryRaw.mock.calls[0][0];
		expect(sql.values).toContain(9);
		expect(sql.values).toContain("RESPONSIBLE");
		expect(sql.values).toContain("RECOMMENDED");
		expect(sql.values).not.toContain("RECOMMENDING");
		expect(sql.text).toContain("c.financial");
	});
	it("fails closed without a binding and supports the assistant visibility type", async () => {
		await getPendingWork({
			scope: {
				...scope,
				allContracts: false,
				allFees: false,
				assignedFees: true,
				employeeTypeValue: "ADMIN_ASSISTANT",
			},
			search,
		});
		const sql: Prisma.Sql = queryRaw.mock.calls[0][0];
		expect(sql.values).toContain(-1);
		expect(sql.values).toContain("ADMIN_ASSISTANT");
		expect(sql.values).not.toContain("RECOMMENDED");
	});
	it("rejects invalid database read models", async () => {
		queryRaw.mockResolvedValue([{ result: { ...result, total: -1 } }]);
		await expect(getPendingWork({ scope, search })).rejects.toThrow();
	});
	it("combines multiselect values within each filter and keeps their intersection", async () => {
		await getPendingWork({
			scope,
			search: {
				...search,
				severity: ["high", "medium"],
				type: ["overdue", "remaining-balance"],
			},
		});
		const sql: Prisma.Sql = queryRaw.mock.calls[0][0];
		expect(sql.text).toContain("severity IN (");
		expect(sql.text).toContain("type IN (");
		expect(sql.values).toEqual(
			expect.arrayContaining([
				"high",
				"medium",
				"overdue",
				"remaining-balance",
			]),
		);
	});
});
