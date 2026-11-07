import { describe, expect, it } from "vitest";
import {
	receivableIdInputSchema,
	receivableSearchSchema,
} from "../schemas/search";
import { receivableWorkspaceSearchSchema } from "../schemas/workspace";
import {
	getReceivableRefreshInterval,
	getReceivableToday,
} from "../utils/date";

describe("receivable search and civil dates", () => {
	it("normalizes invalid URL input and discards scope and detail selection", () => {
		const result = receivableSearchSchema.parse({
			page: -1,
			limit: 1000,
			debtorId: -5,
			contractId: 1.5,
			kind: "INVALID",
			dateFrom: "2026-02-30",
			column: "balance",
			detailId: 8,
			firmId: 999,
		});
		expect(result).toMatchObject({
			page: 1,
			limit: 25,
			debtorId: undefined,
			contractId: undefined,
			kind: "",
			dateFrom: "",
			column: "dueDate",
		});
		expect(result).not.toHaveProperty("firmId");
		expect(result).not.toHaveProperty("detailId");
	});
	it("preserves validated list context and rejects fractional record IDs", () => {
		const search = receivableWorkspaceSearchSchema.parse({
			tab: "receipts",
			returnTo: {
				page: 3,
				query: " Maria ",
				state: "partial",
				direction: "desc",
			},
		});
		expect(search.returnTo).toMatchObject({
			page: 3,
			query: "Maria",
			state: "partial",
			direction: "desc",
		});
		expect(receivableWorkspaceSearchSchema.parse({ tab: "invalid" }).tab).toBe(
			"overview",
		);
		expect(receivableIdInputSchema.safeParse({ id: 1.5 }).success).toBe(false);
	});
	it("uses Sao Paulo midnight rather than UTC midnight", () => {
		expect(getReceivableToday(new Date("2026-11-08T02:59:59Z"))).toBe(
			"2026-11-07",
		);
		expect(getReceivableToday(new Date("2026-11-08T03:00:00Z"))).toBe(
			"2026-11-08",
		);
		expect(getReceivableRefreshInterval(new Date("2026-11-08T02:59:59Z"))).toBe(
			2000,
		);
	});
});
