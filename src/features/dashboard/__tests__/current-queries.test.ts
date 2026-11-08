import { beforeEach, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
	receivable: { findMany: vi.fn() },
	payable: { findMany: vi.fn() },
	$transaction: vi.fn(),
}));
vi.mock("@/shared/lib/prisma", () => ({ prisma: db }));

import { getDashboardDrilldown } from "../data/drilldown";
import { getDashboardRecords } from "../data/records";
import { records, scope } from "./financial-fixtures";

beforeEach(() => {
	vi.clearAllMocks();
	db.$transaction.mockImplementation(async (fn: (tx: typeof db) => unknown) =>
		fn(db),
	);
	db.receivable.findMany.mockResolvedValue(records().receivables);
	db.payable.findMany.mockResolvedValue(records().payables);
});
it("applies firm restrictions before a consistent snapshot and keeps movements for reversed cash", async () => {
	await getDashboardRecords(scope());
	expect(db.receivable.findMany.mock.calls[0][0].where.firmId).toBe(1);
	expect(db.payable.findMany.mock.calls[0][0].where.firmId).toBe(1);
	expect(db.$transaction).toHaveBeenCalledWith(expect.any(Function), {
		isolationLevel: "RepeatableRead",
		timeout: 15000,
	});
	expect(
		db.receivable.findMany.mock.calls[0][0].select.receipts.select.reversal,
	).toBeTruthy();
});
it("never reads a financial subject without its grant", async () => {
	const s = scope();
	s.access = {
		revenueAll: false,
		remunerationAll: false,
		revenue: false,
		remuneration: false,
		expense: false,
		receipts: false,
		payments: false,
	};
	const r = await getDashboardRecords(s);
	expect(r.receivables).toEqual([]);
	expect(r.payables).toEqual([]);
	expect(db.receivable.findMany).not.toHaveBeenCalled();
	expect(db.payable.findMany).not.toHaveBeenCalled();
});
it.each(["revenue", "expense", "result", "remuneration", "planned"] as const)(
	"reconciles drilldown %s to its own signed rows and real title targets",
	async (value) => {
		const s = scope();
		const r = await getDashboardDrilldown(s, {
			search: s.search,
			referenceAt: "2026-03-31T23:59:59.999Z",
			selection: { kind: "metric", value },
		});
		expect(r.amount).toBeCloseTo(
			r.data.reduce((sum, row) => sum + row.amount, 0),
			2,
		);
		expect(r.entries + r.deductions).toBeCloseTo(r.amount, 2);
		for (const row of r.data)
			expect(["receivable", "payable"]).toContain(row.record.kind);
	},
);
