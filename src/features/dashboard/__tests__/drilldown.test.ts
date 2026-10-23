import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@/generated/prisma/client";

const db = vi.hoisted(() => ({
	revenue: { findMany: vi.fn() },
	remuneration: { findMany: vi.fn() },
	expense: { findMany: vi.fn() },
	$transaction: vi.fn(),
}));
vi.mock("@/shared/lib/prisma", () => ({ prisma: db }));

import { buildFinancialAnalysis } from "../data/analysis";
import { getDashboardDrilldown } from "../data/drilldown";
import { getRevenueReceived } from "../data/revenue";
import type { DashboardScope } from "../data/scope";
import {
	type DashboardDrilldownInput,
	dashboardDrilldownInputSchema,
} from "../schemas/drilldown";

const scope: DashboardScope = {
	firmId: 7,
	employeeId: 1,
	isAdmin: true,
	canReadCashFlow: true,
	access: {
		revenue: true,
		remuneration: true,
		expense: true,
		revenueAll: true,
		remunerationAll: true,
	},
	search: {
		dateFrom: "2026-01-01",
		dateTo: "2026-03-31",
		employeeId: "",
		legalArea: [],
		revenueType: [],
	},
};
const input: DashboardDrilldownInput = {
	search: scope.search,
	referenceAt: "2026-03-31T23:59:59.999Z",
	selection: { kind: "area", value: "CIVIL" },
};
const revenue = {
	id: 1,
	totalValue: new Prisma.Decimal(300),
	downPaymentValue: new Prisma.Decimal(100),
	totalInstallments: 2,
	paymentStartDate: new Date("2026-01-01"),
	type: { label: "Judicial", value: "JUDICIAL" },
	contract: {
		client: { id: 1, fullName: "Mesmo nome" },
		processNumber: "P1",
		legalArea: { value: "CIVIL", label: "Cível" },
		assignments: [],
	},
	fees: [
		{
			amount: new Prisma.Decimal(50),
			installmentNumber: 1,
			paymentDate: new Date("2026-02-02"),
		},
	],
};

describe("dashboard drilldown", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		db.$transaction.mockImplementation((read) => read(db));
		db.revenue.findMany.mockResolvedValue([revenue]);
		db.remuneration.findMany.mockResolvedValue([]);
		db.expense.findMany.mockResolvedValue([]);
	});
	it("reconciles the planned-revenue card with full scheduled amounts including paid installments", async () => {
		const result = await getDashboardDrilldown(scope, {
			...input,
			selection: { kind: "metric", value: "planned" },
		});
		expect(result.amount).toBe(300);
		expect(result.data.map((row) => row.amount)).toEqual([100, 100, 100]);
		expect(result.data.map((row) => row.kind)).toEqual([
			"Entrada inicial",
			"Parcela prevista",
			"Parcela prevista",
		]);
		expect(db.remuneration.findMany).not.toHaveBeenCalled();
		expect(db.expense.findMany).not.toHaveBeenCalled();
	});
	it("keeps card access independent from combined monthly chart grants", async () => {
		const expenseOnly: DashboardScope = {
			...scope,
			access: {
				revenue: false,
				remuneration: false,
				expense: true,
				revenueAll: false,
				remunerationAll: false,
			},
		};
		await getDashboardDrilldown(expenseOnly, {
			...input,
			selection: { kind: "metric", value: "expense" },
		});
		expect(db.expense.findMany).toHaveBeenCalled();
		expect(db.revenue.findMany).not.toHaveBeenCalled();
		expect(db.remuneration.findMany).not.toHaveBeenCalled();
		await expect(
			getDashboardDrilldown(expenseOnly, {
				...input,
				selection: { kind: "metric", value: "result" },
			}),
		).rejects.toThrow();
		await expect(
			getDashboardDrilldown(expenseOnly, {
				...input,
				selection: { kind: "metric", value: "planned" },
			}),
		).rejects.toThrow();
	});
	it("returns receipt card movements over the full selected period", async () => {
		const result = await getDashboardDrilldown(scope, {
			...input,
			selection: { kind: "metric", value: "revenue" },
		});
		expect(result.amount).toBe(150);
		expect(result.total).toBe(2);
		expect(result.data[0].kind).toBe("Entrada inicial");
	});
	it("returns complete receipt rows and reconciled totals for frontend pagination", async () => {
		const result = await getDashboardDrilldown(scope, input);
		expect(result).toMatchObject({ total: 2, amount: 150 });
		expect(result.data).toHaveLength(2);
		expect(result.data[0].kind).toBe("Entrada inicial");
		const second = result;
		expect(second.data[1].kind).toBe("Recebimento");
		expect(second.amount).toBe(
			Number(
				getRevenueReceived(revenue, {
					hasPeriod: true,
					dateFrom: new Date("2026-01-01"),
					dateTo: new Date("2026-03-31T23:59:59.999Z"),
				}),
			),
		);
	});
	it("keeps homonymous clients separate in aggregate and detail", async () => {
		const other = {
			...revenue,
			id: 2,
			contract: {
				...revenue.contract,
				client: { id: 2, fullName: "Mesmo nome" },
			},
		};
		db.revenue.findMany.mockResolvedValue([revenue, other]);
		const analysis = buildFinancialAnalysis(
			[revenue, other],
			{ hasPeriod: true },
			new Date(input.referenceAt),
		);
		expect(analysis.clients.map((item) => item.value)).toEqual(["1", "2"]);
		expect(analysis.referenceAt).toBe(input.referenceAt);
		const result = await getDashboardDrilldown(scope, {
			...input,
			selection: { kind: "client", value: "2" },
		});
		expect(result.total).toBe(2);
		expect(result.data.every((row) => row.id.includes(":2"))).toBe(true);
	});
	it("matches historical aging and forecast buckets with partial payments", async () => {
		const analysis = buildFinancialAnalysis(
			[revenue],
			{ hasPeriod: true },
			new Date(input.referenceAt),
		);
		for (const [kind, buckets] of [
			["aging", analysis.aging],
			["forecast", analysis.forecast],
		] as const) {
			for (const bucket of buckets) {
				const request = dashboardDrilldownInputSchema.parse({
					...input,
					selection: { kind, value: bucket.value },
				});
				const result = await getDashboardDrilldown(scope, request);
				expect(result.amount).toBe(bucket.total);
			}
		}
		const result = await getDashboardDrilldown(scope, {
			...input,
			referenceAt: "2026-02-01T00:00:00.000Z",
			selection: { kind: "forecast", value: "Próximos 30 dias" },
		});
		expect(result.data[0]).toMatchObject({
			amount: 100,
			paid: 0,
			faceAmount: 100,
		});
	});
	it("denies forbidden subjects before accessing any database table", async () => {
		await expect(
			getDashboardDrilldown(
				{
					...scope,
					access: {
						revenue: false,
						remuneration: false,
						expense: true,
						revenueAll: false,
						remunerationAll: false,
					},
				},
				input,
			),
		).rejects.toThrow();
		expect(db.$transaction).not.toHaveBeenCalled();
		await expect(
			getDashboardDrilldown(
				{ ...scope, search: { ...scope.search, employeeId: "1" } },
				{
					...input,
					selection: { kind: "monthly", month: "2026-02", series: "result" },
				},
			),
		).rejects.toThrow();
		expect(db.$transaction).not.toHaveBeenCalled();
	});
	it("retains assigned scope and never reads unrelated subjects", async () => {
		await getDashboardDrilldown(
			{
				...scope,
				isAdmin: false,
				employeeId: 5,
				search: { ...scope.search, employeeId: "999" },
				access: {
					revenue: true,
					remuneration: true,
					expense: true,
					revenueAll: false,
					remunerationAll: false,
				},
			},
			input,
		);
		expect(db.revenue.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					firmId: 7,
					contract: expect.objectContaining({
						assignments: {
							some: expect.objectContaining({ employeeId: 5, firmId: 7 }),
						},
					}),
				}),
			}),
		);
		expect(db.remuneration.findMany).not.toHaveBeenCalled();
		expect(db.expense.findMany).not.toHaveBeenCalled();
	});
	it("reconciles a zero net month without hiding its movements", async () => {
		db.expense.findMany.mockResolvedValue([
			{
				id: 1,
				expenseDate: new Date("2026-02-04"),
				amount: new Prisma.Decimal(30),
				notes: null,
				category: { label: "Operação", value: "OPERATION" },
			},
		]);
		db.remuneration.findMany.mockResolvedValue([
			{
				id: 1,
				paymentDate: new Date("2026-02-03"),
				amount: new Prisma.Decimal(20),
				contractEmployee: {
					employee: { fullName: "Pessoa" },
					assignmentType: { label: "Responsável", value: "RESPONSIBLE" },
					contract: { processNumber: "P1" },
				},
			},
		]);
		const result = await getDashboardDrilldown(scope, {
			...input,
			selection: { kind: "monthly", month: "2026-02", series: "result" },
		});
		expect(result).toMatchObject({
			total: 3,
			amount: 0,
			entries: 50,
			deductions: -50,
		});
		expect(result.data.map((row) => row.kind)).toEqual([
			"Recebimento",
			"Remuneração gerada",
			"Despesa",
		]);
	});
	it("excludes receipts outside a partial boundary month", async () => {
		const search = { ...scope.search, dateFrom: "2026-02-03" };
		const result = await getDashboardDrilldown(
			{ ...scope, search },
			{
				...input,
				search,
				selection: { kind: "monthly", month: "2026-02", series: "revenue" },
			},
		);
		expect(result.amount).toBe(0);
	});
	it("rejects unsupported selectors, invalid months and future reference", async () => {
		expect(
			dashboardDrilldownInputSchema.safeParse({
				...input,
				selection: { kind: "monthly", month: "2026-13", series: "revenue" },
			}).success,
		).toBe(false);
		await expect(
			getDashboardDrilldown(scope, {
				...input,
				selection: { kind: "monthly", month: "2025-12", series: "revenue" },
			}),
		).rejects.toThrow();
		await expect(
			getDashboardDrilldown(scope, {
				...input,
				referenceAt: "2099-01-01T00:00:00.000Z",
			}),
		).rejects.toThrow();
		expect(db.$transaction).not.toHaveBeenCalled();
	});

	it("rechecks access between requests and does not execute forbidden subject queries", async () => {
		await getDashboardDrilldown(scope, input);
		db.$transaction.mockClear();
		const expenseOnly: DashboardScope = {
			...scope,
			access: {
				revenue: false,
				remuneration: false,
				expense: true,
				revenueAll: false,
				remunerationAll: false,
			},
		};
		await expect(getDashboardDrilldown(expenseOnly, input)).rejects.toThrow();
		await expect(
			getDashboardDrilldown(expenseOnly, {
				...input,
				selection: { kind: "monthly", month: "2026-02", series: "expense" },
			}),
		).rejects.toThrow();
		expect(db.$transaction).not.toHaveBeenCalled();
		db.revenue.findMany.mockClear();
		await getDashboardDrilldown(expenseOnly, {
			...input,
			selection: { kind: "expense", value: "OPERATION" },
		});
		expect(db.revenue.findMany).not.toHaveBeenCalled();
		expect(db.remuneration.findMany).not.toHaveBeenCalled();
		expect(db.expense.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					firmId: 7,
					deletedAt: null,
					isActive: true,
				}),
			}),
		);
	});
});
