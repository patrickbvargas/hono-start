import { describe, expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import { buildFinancialOverviewDrilldownFromRecords } from "../data/drilldown";
import type { FinancialOverviewRecords } from "../data/records";
import { buildFinancialOverviewSummary } from "../data/summary";
import { buildFinancialDrilldownOverview } from "../hooks/use-drilldown-overview";
import { financialOverviewSearchDefaults } from "../schemas/search";

describe("financial-overview drilldown data and calculations", () => {
	const now = new Date();
	const referenceAt = now.toISOString();

	const records: FinancialOverviewRecords = {
		scope: {
			firmId: 1,
			search: financialOverviewSearchDefaults,
		},
		receivables: [
			{
				id: 1,
				amount: new Prisma.Decimal(1000),
				dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // future
				cancelledAt: null,
				kind: "INSTALLMENT",
				debtor: { person: { fullName: "Cliente A" } },
				analytic: { label: "Honorários", value: "FEES" },
				expectedPaymentMethod: { label: "Pix", value: "PIX" },
				receipts: [],
				contractRevenueReceivable: {
					contract: {
						id: 101,
						processNumber: "12345-67",
						customer: { id: 50, person: { fullName: "Cliente A" } },
						legalArea: { label: "Previdenciário", value: "PREV" },
					},
					revenue: {
						revenueType: { label: "Administrativo", value: "ADMINISTRATIVE" },
					},
				},
			},
			{
				id: 2,
				amount: new Prisma.Decimal(500),
				dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // past
				cancelledAt: null,
				kind: "INSTALLMENT",
				debtor: { person: { fullName: "Cliente B" } },
				analytic: { label: "Honorários", value: "FEES" },
				expectedPaymentMethod: { label: "Boleto", value: "BOLETO" },
				receipts: [
					{
						id: 10,
						principalAbated: new Prisma.Decimal(500),
						effectiveAmount: new Prisma.Decimal(500),
						effectiveDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
						reversal: null,
					},
				],
				contractRevenueReceivable: {
					contract: {
						id: 102,
						processNumber: "98765-43",
						customer: { id: 51, person: { fullName: "Cliente B" } },
						legalArea: { label: "Previdenciário", value: "PREV" },
					},
					revenue: {
						revenueType: { label: "Judicial", value: "JUDICIAL" },
					},
				},
			},
			{
				id: 3,
				amount: new Prisma.Decimal(300),
				dueDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // overdue by 40 days
				cancelledAt: null,
				kind: "INSTALLMENT",
				debtor: { person: { fullName: "Cliente C" } },
				analytic: { label: "Honorários", value: "FEES" },
				expectedPaymentMethod: { label: "Pix", value: "PIX" },
				receipts: [],
				contractRevenueReceivable: null,
			},
		],
		payables: [
			{
				id: 4,
				amount: new Prisma.Decimal(200),
				dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
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
						effectiveDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
						reversal: null,
					},
				],
				remunerationPayable: null,
			},
			{
				id: 5,
				amount: new Prisma.Decimal(150),
				dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // future open payable
				cancelledAt: null,
				kind: "INSTALLMENT",
				beneficiary: { person: { fullName: "Dr. Advogado" } },
				analytic: { label: "Remuneração", value: "REMUN" },
				expectedPaymentMethod: { label: "Pix", value: "PIX" },
				payments: [],
				remunerationPayable: {
					createdAt: new Date(),
					contractAssignment: {
						employeeProfileId: 12,
						employeeProfile: { person: { fullName: "Dr. Advogado" } },
						assignmentType: { label: "Advogado", value: "LAWYER" },
						contract: {
							id: 101,
							processNumber: "12345-67",
							customer: { id: 50, person: { fullName: "Cliente A" } },
							legalArea: { label: "Previdenciário", value: "PREV" },
						},
					},
				},
			},
		],
	};

	it("strictly matches metric card amounts with drilldown sum", () => {
		const summary = buildFinancialOverviewSummary(records);

		for (const metric of summary.metrics) {
			const drilldown = buildFinancialOverviewDrilldownFromRecords(records, {
				selection: { kind: "metric", value: metric.drilldown },
				search: financialOverviewSearchDefaults,
				referenceAt,
			});

			expect(drilldown.amount).toBeCloseTo(metric.value, 2);
		}
	});

	it("matches aging breakdown amounts", () => {
		const summary = buildFinancialOverviewSummary(records);
		const agingItem = summary.aging.find((a) => a.value === "31–60 dias");
		expect(agingItem).toBeDefined();
		expect(agingItem?.total).toBe(300);

		const drilldown = buildFinancialOverviewDrilldownFromRecords(records, {
			selection: { kind: "aging", value: "31–60 dias" },
			search: financialOverviewSearchDefaults,
			referenceAt,
		});

		expect(drilldown.amount).toBe(300);
		expect(drilldown.data).toHaveLength(1);
		expect(drilldown.data[0].client).toBe("Cliente C");
	});

	it("matches forecast breakdown amounts", () => {
		const summary = buildFinancialOverviewSummary(records);
		const forecastItem = summary.forecast.find(
			(f) => f.value === "Próximos 30 dias",
		);
		expect(forecastItem).toBeDefined();
		expect(forecastItem?.total).toBe(1000);

		const drilldown = buildFinancialOverviewDrilldownFromRecords(records, {
			selection: { kind: "forecast", value: "Próximos 30 dias" },
			search: financialOverviewSearchDefaults,
			referenceAt,
		});

		expect(drilldown.amount).toBe(1000);
		expect(drilldown.data).toHaveLength(1);
		expect(drilldown.data[0].client).toBe("Cliente A");
	});

	it("matches expense category breakdown amounts", () => {
		const summary = buildFinancialOverviewSummary(records);
		const rentCategory = summary.expenseCategories.find(
			(c) => c.value === "RENT",
		);
		expect(rentCategory).toBeDefined();
		expect(rentCategory?.total).toBe(200);

		const drilldown = buildFinancialOverviewDrilldownFromRecords(records, {
			selection: { kind: "category", value: "RENT" },
			search: financialOverviewSearchDefaults,
			referenceAt,
		});

		expect(drilldown.amount).toBe(200);
		expect(drilldown.data).toHaveLength(1);
		expect(drilldown.data[0].description).toBe("Fornecedor X");
	});

	it("generates multi-dimensional groups in drilldown overview", () => {
		const drilldown = buildFinancialOverviewDrilldownFromRecords(records, {
			selection: { kind: "metric", value: "realized_balance" },
			search: financialOverviewSearchDefaults,
			referenceAt,
		});

		const overview = buildFinancialDrilldownOverview({
			rows: drilldown.data,
			selection: { kind: "metric", value: "realized_balance" },
		});

		expect(overview.length).toBeGreaterThan(0);
		const kindDimension = overview.find((d) => d.key === "kind");
		expect(kindDimension).toBeDefined();
		expect(kindDimension?.groups.some((g) => g.label === "Recebimento")).toBe(
			true,
		);
		expect(kindDimension?.groups.some((g) => g.label === "Pagamento")).toBe(
			true,
		);
	});
});
