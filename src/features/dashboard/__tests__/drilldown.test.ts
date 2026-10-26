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

const scope = {
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
} satisfies DashboardScope;
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
		id: 1,
		processNumber: "P1",
		legalArea: { value: "CIVIL", label: "Cível" },
		assignments: [],
	},
	fees: [
		{
			id: 91,
			amount: new Prisma.Decimal(50),
			installmentNumber: 1,
			paymentDate: new Date("2026-02-02"),
		},
	],
};

describe("dashboard drilldown", () => {
	it("returns persisted summary targets independent of synthetic row identities", async () => {
		const result = await getDashboardDrilldown(scope, input);
		expect(
			result.data.find((row) => row.kind === "Recebimento")?.record,
		).toEqual({ kind: "fee", id: 91 });
		expect(
			result.data.find((row) => row.id.startsWith("down-payment:"))?.record,
		).toEqual({ kind: "contract", id: 1 });
		const planned = await getDashboardDrilldown(scope, {
			...input,
			selection: { kind: "metric", value: "planned" },
		});
		expect(planned.data.length).toBeGreaterThan(0);
		expect(
			planned.data.every(
				(row) => row.record.kind === "contract" && row.record.id === 1,
			),
		).toBe(true);
	});
	it.each(["area", "type"] as const)(
		"scopes %s remuneration details independently from receipts",
		async (kind) => {
			const ownScope = {
				...scope,
				isAdmin: false,
				access: { ...scope.access, remunerationAll: false },
			};
			await getDashboardDrilldown(ownScope, {
				...input,
				selection: {
					kind,
					value: kind === "area" ? "CIVIL" : "JUDICIAL",
					series: "remuneration",
				},
			});
			expect(db.revenue.findMany).not.toHaveBeenCalled();
			expect(db.remuneration.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({
						firmId: 7,
						contractEmployee: expect.objectContaining({ employeeId: 1 }),
						AND: [
							kind === "area"
								? {
										contractEmployee: {
											contract: { legalArea: { value: "CIVIL" } },
										},
									}
								: { fee: { revenue: { type: { value: "JUDICIAL" } } } },
						],
					}),
				}),
			);
			await expect(
				getDashboardDrilldown(
					{ ...ownScope, access: { ...ownScope.access, remuneration: false } },
					{
						...input,
						selection: { kind, value: "CIVIL", series: "remuneration" },
					},
				),
			).rejects.toThrow();
		},
	);
	beforeEach(() => {
		vi.clearAllMocks();
		db.$transaction.mockImplementation((read) => read(db));
		db.revenue.findMany.mockResolvedValue([revenue]);
		db.remuneration.findMany.mockResolvedValue([]);
		db.expense.findMany.mockResolvedValue([]);
	});
	it("scopes employee-month details to the selected collaborator, dimensions and partial month", async () => {
		const search = {
			...scope.search,
			dateFrom: "2026-02-10",
			legalArea: ["CIVIL"],
		};
		await getDashboardDrilldown(
			{ ...scope, search },
			{
				...input,
				search,
				selection: { kind: "employee-month", employeeId: 5, month: "2026-02" },
			},
		);
		expect(db.remuneration.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					firmId: 7,
					deletedAt: null,
					isActive: true,
					contractEmployee: {
						contract: { legalArea: { value: { in: ["CIVIL"] } } },
					},
					AND: [{ contractEmployee: { employeeId: 5 } }],
					paymentDate: {
						gte: new Date("2026-02-10T00:00:00.000Z"),
						lte: new Date("2026-02-28T23:59:59.999Z"),
					},
				}),
			}),
		);
		expect(db.revenue.findMany).not.toHaveBeenCalled();
		expect(db.expense.findMany).not.toHaveBeenCalled();
	});
	it("denies forged collaborator, month and missing remuneration grant before reading", async () => {
		const request: DashboardDrilldownInput = {
			...input,
			selection: { kind: "employee-month", employeeId: 5, month: "2026-02" },
		};
		for (const restricted of [
			{ ...scope, isAdmin: false, employeeId: 1 },
			{ ...scope, search: { ...scope.search, employeeId: "1" } },
			{ ...scope, access: { ...scope.access, remuneration: false } },
		]) {
			await expect(
				getDashboardDrilldown(restricted, request),
			).rejects.toThrow();
		}
		await expect(
			getDashboardDrilldown(scope, {
				...request,
				selection: { kind: "employee-month", employeeId: 5, month: "2025-12" },
			}),
		).rejects.toThrow();
		expect(db.$transaction).not.toHaveBeenCalled();
		await getDashboardDrilldown(
			{
				...scope,
				isAdmin: false,
				employeeId: 5,
				access: { ...scope.access, revenue: false, remunerationAll: false },
			},
			request,
		);
		expect(db.remuneration.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					contractEmployee: { employeeId: 5 },
					AND: [{ contractEmployee: { employeeId: 5 } }],
				}),
			}),
		);
	});
	it("limits collaborator totals to displayed months when the period is unbounded", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-03-31T12:00:00.000Z"));
		try {
			const search = { ...scope.search, dateFrom: "", dateTo: "" };
			await getDashboardDrilldown(
				{ ...scope, search },
				{
					...input,
					search,
					referenceAt: "2026-03-31T12:00:00.000Z",
					selection: { kind: "employee-month", employeeId: 5 },
				},
			);
			expect(db.remuneration.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({
						AND: [{ contractEmployee: { employeeId: 5 } }],
						paymentDate: {
							gte: new Date("2025-10-01T00:00:00.000Z"),
							lte: new Date("2026-03-31T23:59:59.999Z"),
						},
					}),
				}),
			);
		} finally {
			vi.useRealTimers();
		}
	});
	it("reconciles monthly revenue-type and output cells without unrelated movements", async () => {
		const judicial = await getDashboardDrilldown(scope, {
			...input,
			selection: {
				kind: "monthly",
				month: "2026-02",
				series: "revenue",
				revenueType: "JUDICIAL",
			},
		});
		expect(judicial.amount).toBe(50);
		const administrative = await getDashboardDrilldown(scope, {
			...input,
			selection: {
				kind: "monthly",
				month: "2026-02",
				series: "revenue",
				revenueType: "ADMINISTRATIVE",
			},
		});
		expect(administrative.amount).toBe(0);
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
		db.revenue.findMany.mockClear();
		const output = await getDashboardDrilldown(scope, {
			...input,
			selection: { kind: "monthly", month: "2026-02", series: "output" },
		});
		expect(output).toMatchObject({ amount: 30, total: 1 });
		expect(output.data[0].record).toEqual({ kind: "expense", id: 1 });
		const remunerations = await getDashboardDrilldown(scope, {
			...input,
			selection: { kind: "metric", value: "remuneration" },
		});
		expect(remunerations.data[0].record).toEqual({
			kind: "remuneration",
			id: 1,
		});
		expect(db.revenue.findMany).not.toHaveBeenCalled();
		await expect(
			getDashboardDrilldown(
				{ ...scope, canReadCashFlow: false },
				{
					...input,
					selection: { kind: "monthly", month: "2026-02", series: "output" },
				},
			),
		).rejects.toThrow();
		await expect(
			getDashboardDrilldown(scope, {
				...input,
				selection: {
					kind: "monthly",
					month: "2026-02",
					series: "expense",
					revenueType: "JUDICIAL",
				},
			}),
		).rejects.toThrow();
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
			total: 2,
			amount: 20,
			entries: 50,
			deductions: -30,
		});
		expect(result.data.map((row) => row.kind)).toEqual([
			"Recebimento",
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
