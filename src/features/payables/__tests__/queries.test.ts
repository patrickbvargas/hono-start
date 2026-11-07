import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LoggedUserSession } from "@/shared/session/schema";

const mocks = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock("@/shared/lib/prisma", () => ({ prisma: { $queryRaw: mocks.query } }));

import {
	getPayableById,
	getPayableOptions,
	getPayables,
} from "../data/queries";
import { payableSearchSchema } from "../schemas/search";

const session = {
	permissions: ["org:payables:read_own"],
	firm: { id: 3 },
	person: { id: 71 },
	employee: { id: 17 },
	employeeType: { value: "LAWYER" },
} as LoggedUserSession;
beforeEach(() => {
	mocks.query.mockReset();
});
describe("payable database queries", () => {
	it("scopes before filtering, aggregates before paging and parameterizes user input", async () => {
		mocks.query.mockResolvedValue([
			{
				payload: {
					data: [],
					total: 0,
					totals: {
						amount: 0,
						balance: 0,
						principalAbated: 0,
						overdue: 0,
						cancelled: 0,
					},
				},
			},
		]);
		const query = payableSearchSchema.parse({
			query: "%' OR TRUE --",
			state: "partial",
			page: 3,
			limit: 10,
			column: "amount",
			direction: "desc",
		});
		await getPayables(session, query);
		const sql = mocks.query.mock.calls[0][0];
		expect(sql.text).not.toContain(query.query);
		expect(sql.values).toContain(3);
		expect(sql.values).toContain(17);
		expect(sql.values).toContain(71);
		expect(sql.text).toContain('cp."personId" =');
		expect(sql.text).toContain("rb.id IS NOT NULL AND");
		expect(sql.values).toContain("RESPONSIBLE");
		expect(sql.text).toContain('"isPartial" = TRUE');
		expect(sql.text).toContain("ORDER BY amount DESC, id ASC");
		expect(sql.values.slice(-2)).toEqual([10, 20]);
		expect(sql.text).toContain("FROM filtered");
		expect(sql.text).toContain("payment_reversals");
		expect(sql.text).not.toContain('c."deletedAt" IS NULL');
	});
	it("does not accept a foreign or invisible ID as a detail", async () => {
		mocks.query.mockResolvedValue([]);
		await expect(getPayableById(session, 99)).rejects.toThrow(
			"Título não encontrado",
		);
	});
	it("validates database results instead of returning malformed payloads", async () => {
		mocks.query.mockResolvedValue([{ payload: { data: [{ id: 1 }] } }]);
		await expect(
			getPayables(session, payableSearchSchema.parse({})),
		).rejects.toThrow();
	});
	it("retains historical option labels as enabled filter choices", async () => {
		mocks.query.mockResolvedValue([
			{
				payload: {
					beneficiaries: [
						{ id: 1, value: "1", label: "Histórico", isActive: true },
					],
					contracts: [],
					analytics: [],
					methods: [],
				},
			},
		]);
		const options = await getPayableOptions(session);
		expect(options.beneficiaries[0]).toMatchObject({
			isDisabled: false,
			value: "1",
		});
	});
});
