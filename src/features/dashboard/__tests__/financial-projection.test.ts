import { describe, expect, it } from "vitest";
import { buildDashboardProjection } from "../data/projection";
import { getOutstanding } from "../data/records";
import { buildDashboardSummary } from "../data/summary";
import { money, records, scope } from "./financial-fixtures";

describe("title based financial projections", () => {
	it("records actual cash and its reversal in distinct months", () => {
		const result = buildDashboardSummary(records());
		expect(result.cashFlow?.table[0]).toMatchObject({
			entry: 90,
			output: 45,
			balance: 45,
			administrative: 90,
		});
		expect(result.cashFlow?.table[1]).toMatchObject({
			entry: -90,
			output: 0,
			balance: -90,
		});
		expect(result.metrics.find((m) => m.drilldown === "result")?.value).toBe(
			-45,
		);
	});
	it("uses principal, not cash, for historical and reopened balances", () => {
		const data = records(),
			title = data.receivables[0];
		expect(
			Number(getOutstanding(title, title.receipts, new Date("2026-01-31"))),
		).toBe(0);
		expect(
			Number(getOutstanding(title, title.receipts, new Date("2026-02-03"))),
		).toBe(100);
	});
	it("does not treat an entry or negotiated plan as already received", () => {
		const data = records();
		data.receivables[0].receipts = [];
		const summary = buildDashboardSummary(data);
		expect(summary.metrics.find((m) => m.drilldown === "planned")?.value).toBe(
			100,
		);
		expect(summary.metrics.find((m) => m.drilldown === "revenue")?.value).toBe(
			0,
		);
	});
	it("excludes cancelled titles from projections while retaining historical cash", () => {
		const data = records();
		data.receivables[0].cancelledAt = new Date("2026-02-02");
		const projection = buildDashboardProjection(data, new Date("2026-03-31"));
		expect(projection.rows.filter((r) => r.source === "planned")).toHaveLength(
			0,
		);
		expect(projection.open).toHaveLength(0);
		expect(
			projection.rows.filter(
				(r) => r.source === "cash" && r.direction === "entry",
			),
		).toHaveLength(2);
	});
	it("does not fabricate a schedule for a title whose due date was adjusted", () => {
		const data = records();
		data.receivables[0].dueDate = new Date("2026-03-27");
		expect(
			buildDashboardProjection(data, new Date("2026-03-31")).rows.find(
				(r) => r.source === "planned",
			)?.date,
		).toBe("2026-03-27T00:00:00.000Z");
	});
	it("rounds totals using Decimal without floating point accumulation", () => {
		const data = records();
		data.payables = [];
		data.receivables[0].receipts = [];
		data.receivables = [
			...Array.from({ length: 3 }, (_, i) => ({
				...data.receivables[0],
				id: i + 1,
				amount: money(i === 2 ? 33.34 : 33.33),
			})),
		];
		expect(
			buildDashboardSummary(data).metrics.find((m) => m.drilldown === "planned")
				?.value,
		).toBe(100);
	});
	it("omits receipt and payment events when their independent grants are absent", () => {
		const data = records();
		data.scope.access = {
			...(data.scope.access ?? scope().access),
			receipts: false,
			payments: false,
		};
		const summary = buildDashboardSummary(data);
		expect(summary.metrics.map((m) => m.drilldown)).not.toContain("revenue");
		expect(summary.cashFlow).toBeNull();
		expect(
			buildDashboardProjection(data, new Date()).rows.some(
				(r) => r.source === "cash",
			),
		).toBe(false);
	});
	it("keeps generated remuneration separate from actual payment", () => {
		const data = records();
		const title = data.payables[0];
		const contract = data.receivables[0].contractRevenueReceivable?.contract;
		if (!contract) {
			throw new Error("Missing contractual fixture");
		}
		title.payments = [];
		title.remunerationPayable = {
			createdAt: new Date("2026-01-15"),
			contractAssignment: {
				employeeProfileId: 2,
				employeeProfile: { person: { fullName: "Advogada" } },
				assignmentType: { label: "Responsável", value: "RESPONSIBLE" },
				contract,
			},
			receipt: {
				receivable: {
					contractRevenueReceivable: {
						revenue: {
							revenueType: { label: "Administrativo", value: "ADMINISTRATIVE" },
						},
					},
				},
			},
		};
		expect(
			buildDashboardSummary(data).metrics.find(
				(m) => m.drilldown === "remuneration",
			)?.value,
		).toBe(50);
		expect(buildDashboardSummary(data).cashFlow?.table[0].output).toBe(0);
		title.cancelledAt = new Date("2026-02-02");
		expect(
			buildDashboardSummary(data).metrics.find(
				(m) => m.drilldown === "remuneration",
			)?.value,
		).toBe(0);
	});
});
