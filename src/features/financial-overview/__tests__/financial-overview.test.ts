import { describe, expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import type { FinancialOverviewRecords } from "../data/records";
import { buildFinancialOverviewSummary } from "../data/summary";
import { financialOverviewSearchDefaults } from "../schemas/search";

describe("financial-overview summary and projections", () => {
	it("distinguishes realized cash events from future projected open titles", () => {
		const records: FinancialOverviewRecords = {
			scope: {
				firmId: 1,
				search: financialOverviewSearchDefaults,
			},
			receivables: [
				{
					id: 1,
					amount: new Prisma.Decimal(1000),
					dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // future
					cancelledAt: null,
					kind: "INSTALLMENT",
					debtor: { person: { fullName: "Cliente A" } },
					analytic: { label: "Honorários", value: "FEES" },
					expectedPaymentMethod: { label: "Pix", value: "PIX" },
					receipts: [],
					contractRevenueReceivable: null,
				},
				{
					id: 2,
					amount: new Prisma.Decimal(500),
					dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // past
					cancelledAt: null,
					kind: "INSTALLMENT",
					debtor: { person: { fullName: "Cliente B" } },
					analytic: { label: "Honorários", value: "FEES" },
					expectedPaymentMethod: { label: "Pix", value: "PIX" },
					receipts: [
						{
							id: 10,
							principalAbated: new Prisma.Decimal(500),
							effectiveAmount: new Prisma.Decimal(500),
							effectiveDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
							reversal: null,
						},
					],
					contractRevenueReceivable: null,
				},
			],
			payables: [
				{
					id: 3,
					amount: new Prisma.Decimal(200),
					dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
					cancelledAt: null,
					kind: "INSTALLMENT",
					beneficiary: { person: { fullName: "Fornecedor X" } },
					analytic: { label: "Aluguel", value: "RENT" },
					expectedPaymentMethod: { label: "Pix", value: "PIX" },
					payments: [
						{
							id: 20,
							principalAbated: new Prisma.Decimal(200),
							effectiveAmount: new Prisma.Decimal(200),
							effectiveDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
							reversal: null,
						},
					],
					remunerationPayable: null,
				},
			],
		};

		const summary = buildFinancialOverviewSummary(records);

		expect(summary.metrics).toHaveLength(4);

		// Realized balance = 500 - 200 = 300
		const realizedMetric = summary.metrics.find(
			(m) => m.drilldown === "realized_balance",
		);
		expect(realizedMetric?.value).toBe(300);

		// Total to receive = 1000 (open future title)
		const receivableMetric = summary.metrics.find(
			(m) => m.drilldown === "receivables",
		);
		expect(receivableMetric?.value).toBe(1000);

		// Projected balance = 300 + 1000 = 1300
		const projectedMetric = summary.metrics.find(
			(m) => m.drilldown === "projected_balance",
		);
		expect(projectedMetric?.value).toBe(1300);

		// Monthly evolution has past and future months
		expect(summary.monthlyEvolution.length).toBeGreaterThan(0);
		expect(summary.monthlyEvolution.some((m) => m.isFuture)).toBe(true);

		// Expense categories has RENT
		expect(summary.expenseCategories).toHaveLength(1);
		expect(summary.expenseCategories[0].label).toBe("Aluguel");
		expect(summary.expenseCategories[0].total).toBe(200);

		// Past months ignore projected values
		const pastMonths = summary.monthlyEvolution.filter(
			(m) => !m.isFuture && !m.isCurrentMonth,
		);
		for (const pm of pastMonths) {
			expect(pm.entryProjected).toBe(0);
			expect(pm.outputProjected).toBe(0);
		}

		// Comparative metrics
		for (const metric of summary.metrics) {
			expect(metric.previousLabel).toBeDefined();
			expect(metric.previousPeriodLabel).toBeDefined();
		}
	});
});
