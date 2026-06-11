import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		client: {
			findMany: vi.fn(),
		},
		contract: {
			findMany: vi.fn(),
		},
		revenue: {
			findMany: vi.fn(),
		},
		fee: {
			findMany: vi.fn(),
		},
		expense: {
			findMany: vi.fn(),
		},
		remuneration: {
			findMany: vi.fn(),
		},
		employee: {
			findMany: vi.fn(),
		},
	},
}));

vi.mock("@/shared/lib/prisma", () => ({
	prisma: prismaMock,
}));

import {
	getDashboardEmployeeOptions,
	getDashboardSummary,
} from "../data/queries";

describe("dashboard data queries", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("builds admin summary totals and monthly remuneration table buckets", async () => {
		prismaMock.revenue.findMany
			.mockResolvedValueOnce([
				{
					id: 1,
					totalValue: "1000",
					downPaymentValue: "100",
					paymentStartDate: new Date("2026-01-05T00:00:00.000Z"),
					totalInstallments: 3,
					type: { label: "Mensal", value: "MONTHLY" },
					contract: {
						processNumber: "PROC-1",
						client: {
							fullName: "Cliente A",
						},
						legalArea: { label: "Previdenciário", value: "SOCIAL_SECURITY" },
						assignments: [
							{
								employee: { fullName: "Maria Silva" },
								assignmentType: { value: "RESPONSIBLE" },
							},
						],
					},
					fees: [
						{
							amount: "200",
							paymentDate: new Date("2026-01-21T00:00:00.000Z"),
							installmentNumber: 1,
						},
					],
				},
				{
					id: 2,
					totalValue: "500",
					downPaymentValue: "50",
					paymentStartDate: new Date("2025-12-20T00:00:00.000Z"),
					totalInstallments: 2,
					type: { label: "Êxito", value: "SUCCESS" },
					contract: {
						processNumber: "PROC-2",
						client: {
							fullName: "Cliente B",
						},
						legalArea: { label: "Cível", value: "CIVIL" },
						assignments: [
							{
								employee: { fullName: "Ana Souza" },
								assignmentType: { value: "RECOMMENDED" },
							},
						],
					},
					fees: [
						{
							amount: "100",
							paymentDate: new Date("2026-03-12T00:00:00.000Z"),
							installmentNumber: 2,
						},
					],
				},
			])
			.mockResolvedValueOnce([
				{
					downPaymentValue: "100",
					paymentStartDate: new Date("2026-01-05T00:00:00.000Z"),
					type: { value: "ADMINISTRATIVE" },
				},
			])
			.mockResolvedValueOnce([
				{
					downPaymentValue: "100",
					paymentStartDate: new Date("2026-01-05T00:00:00.000Z"),
					type: { value: "ADMINISTRATIVE" },
				},
			]);
		prismaMock.fee.findMany
			.mockResolvedValueOnce([{ amount: "200" }, { amount: "100" }])
			.mockResolvedValueOnce([{ amount: "50" }])
			.mockResolvedValueOnce([
				{
					amount: "200",
					paymentDate: new Date("2026-01-21T00:00:00.000Z"),
				},
				{
					amount: "100",
					paymentDate: new Date("2026-03-12T00:00:00.000Z"),
				},
			])
			.mockResolvedValueOnce([
				{
					amount: "200",
					paymentDate: new Date("2026-01-21T00:00:00.000Z"),
					revenue: {
						type: { value: "ADMINISTRATIVE" },
					},
				},
				{
					amount: "100",
					paymentDate: new Date("2026-03-12T00:00:00.000Z"),
					revenue: {
						type: { value: "SUCCUMBENCY" },
					},
				},
			]);
		prismaMock.remuneration.findMany
			.mockResolvedValueOnce([{ amount: "60" }, { amount: "40" }])
			.mockResolvedValueOnce([{ amount: "60" }, { amount: "40" }])
			.mockResolvedValueOnce([{ amount: "20" }])
			.mockResolvedValueOnce([
				{
					amount: "60",
					paymentDate: new Date("2026-01-22T00:00:00.000Z"),
				},
				{
					amount: "40",
					paymentDate: new Date("2026-03-11T00:00:00.000Z"),
				},
			])
			.mockResolvedValueOnce([
				{
					amount: "60",
					paymentDate: new Date("2026-01-22T00:00:00.000Z"),
					contractEmployee: {
						employee: { id: 10, fullName: "Maria Silva" },
					},
				},
				{
					amount: "40",
					paymentDate: new Date("2026-03-11T00:00:00.000Z"),
					contractEmployee: {
						employee: { id: 9, fullName: "Ana Souza" },
					},
				},
			]);
		prismaMock.expense.findMany
			.mockResolvedValueOnce([{ amount: "80" }])
			.mockResolvedValueOnce([{ amount: "80" }])
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([
				{
					amount: "80",
					expenseDate: new Date("2026-02-07T00:00:00.000Z"),
				},
			]);

		const result = await getDashboardSummary({
			firmId: 1,
			isAdmin: true,
			search: {
				dateFrom: "2026-01-01",
				dateTo: "2026-03-31",
				employeeId: "",
				legalArea: [],
				revenueType: [],
			},
		});

		expect(result.scopeLabel).toBe("Visão da firma");
		expect(result.metrics).toEqual([
			expect.objectContaining({
				label: "Saldo total",
				value: 220,
				currentValue: 120,
				previousValue: 30,
				previousPeriodLabel: "01/01/2025 a 31/03/2025",
			}),
			expect.objectContaining({
				label: "Receita prevista",
				value: 1000,
				currentValue: 1000,
				previousValue: 0,
				previousPeriodLabel: "01/01/2025 a 31/03/2025",
				changePercent: 100,
			}),
			expect.objectContaining({
				label: "Receita recebida",
				value: 400,
				currentValue: 300,
				previousValue: 50,
				changePercent: 500,
			}),
			expect.objectContaining({
				label: "Remunerações",
				value: 100,
				currentValue: 100,
				previousValue: 20,
				changePercent: 400,
			}),
		]);
		expect(result.legalAreaRevenue).toEqual([
			expect.objectContaining({
				label: "Previdenciário",
				total: 300,
				percentage: 75,
			}),
			expect.objectContaining({
				label: "Cível",
				total: 100,
				percentage: 25,
			}),
		]);
		expect(result.revenueTypeRevenue).toEqual([
			expect.objectContaining({ label: "Mensal", total: 300 }),
			expect.objectContaining({ label: "Êxito", total: 100 }),
		]);
		expect(result.financialEvolutionLabel).toBe("Jan/2026 a Mar/2026");
		expect(result.financialEvolution).toEqual([
			{
				month: "2026-01",
				revenue: 300,
				remuneration: 60,
			},
			{
				month: "2026-02",
				revenue: 0,
				remuneration: 0,
			},
			{
				month: "2026-03",
				revenue: 100,
				remuneration: 40,
			},
		]);
		expect(result.remunerationMonths).toEqual([
			{ key: "2026-01", label: "Jan/26" },
			{ key: "2026-02", label: "Fev/26" },
			{ key: "2026-03", label: "Mar/26" },
		]);
		expect(result.remunerationTable).toEqual([
			expect.objectContaining({
				employeeId: 9,
				employeeName: "Ana Souza",
				months: {
					"2026-01": 0,
					"2026-02": 0,
					"2026-03": 40,
				},
				total: 40,
				formattedTotal: expect.stringContaining("40,00"),
			}),
			expect.objectContaining({
				employeeId: 10,
				employeeName: "Maria Silva",
				months: {
					"2026-01": 60,
					"2026-02": 0,
					"2026-03": 0,
				},
				total: 60,
				formattedTotal: expect.stringContaining("60,00"),
			}),
		]);
		expect(result.remunerationSubtotal).toEqual({
			label: "Subtotal",
			months: {
				"2026-01": 60,
				"2026-02": 0,
				"2026-03": 40,
			},
			total: 100,
			formattedTotal: expect.stringContaining("100,00"),
		});
		expect(result.overdueInstallments).toHaveLength(2);
		expect(result.overdueInstallments).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					contractProcessNumber: "PROC-1",
					clientName: "Cliente A",
					lawyerName: "Maria Silva",
					legalArea: "Previdenciário",
					revenueType: "Mensal",
					installmentNumber: 2,
				}),
				expect.objectContaining({
					contractProcessNumber: "PROC-2",
					clientName: "Cliente B",
					lawyerName: "Ana Souza",
					legalArea: "Cível",
					revenueType: "Êxito",
					installmentNumber: 1,
				}),
			]),
		);
		expect(result.cashFlow).toEqual({
			totalBalance: 220,
			formattedTotalBalance: expect.stringContaining("220,00"),
			chartLabel: "Jan/2026 a Mar/2026",
			chart: [
				{
					month: "2026-01",
					entry: 300,
					output: 60,
					balance: 240,
				},
				{
					month: "2026-02",
					entry: 0,
					output: 80,
					balance: -80,
				},
				{
					month: "2026-03",
					entry: 100,
					output: 40,
					balance: 60,
				},
			],
			table: [
				{
					month: "2026-01",
					monthLabel: "Jan/26",
					administrative: 300,
					judicial: 0,
					succumbency: 0,
					entry: 300,
					remuneration: 60,
					expense: 0,
					output: 60,
					balance: 240,
				},
				{
					month: "2026-02",
					monthLabel: "Fev/26",
					administrative: 0,
					judicial: 0,
					succumbency: 0,
					entry: 0,
					remuneration: 0,
					expense: 80,
					output: 80,
					balance: -80,
				},
				{
					month: "2026-03",
					monthLabel: "Mar/26",
					administrative: 0,
					judicial: 0,
					succumbency: 100,
					entry: 100,
					remuneration: 40,
					expense: 0,
					output: 40,
					balance: 60,
				},
			],
		});
	});

	it("keeps regular users scoped to assigned-contract and own-remuneration data", async () => {
		prismaMock.revenue.findMany.mockResolvedValue([]).mockResolvedValueOnce([]);
		prismaMock.fee.findMany
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([]);
		prismaMock.remuneration.findMany
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([]);

		const result = await getDashboardSummary({
			firmId: 1,
			employeeId: 10,
			isAdmin: false,
			search: {
				dateFrom: "2026-01-01",
				dateTo: "2026-12-31",
				employeeId: "999",
				legalArea: [],
				revenueType: [],
			},
		});

		expect(prismaMock.revenue.findMany).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				where: expect.objectContaining({
					contract: expect.objectContaining({
						assignments: {
							some: {
								firmId: 1,
								employeeId: 10,
								deletedAt: null,
								isActive: true,
							},
						},
					}),
				}),
			}),
		);
		expect(prismaMock.remuneration.findMany).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				where: expect.objectContaining({
					contractEmployee: { employeeId: 10 },
				}),
			}),
		);
		expect(result.scopeLabel).toBe("Minha visão");
		expect(result.remunerationSubtotal).toBeNull();
		expect(result.overdueInstallments).toEqual([]);
		expect(result.cashFlow).toBeNull();
		expect(prismaMock.expense.findMany).not.toHaveBeenCalled();
	});

	it("applies legal-area and revenue-type filters to remuneration aggregation", async () => {
		prismaMock.revenue.findMany.mockResolvedValue([]).mockResolvedValueOnce([]);
		prismaMock.fee.findMany
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([]);
		prismaMock.expense.findMany
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([]);
		prismaMock.remuneration.findMany
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([]);
		prismaMock.revenue.findMany.mockResolvedValueOnce([]);

		await getDashboardSummary({
			firmId: 1,
			isAdmin: true,
			search: {
				dateFrom: "2026-01-01",
				dateTo: "2026-12-31",
				employeeId: "",
				legalArea: ["SOCIAL_SECURITY", "CIVIL"],
				revenueType: ["MONTHLY", "SUCCESS"],
			},
		});

		expect(prismaMock.revenue.findMany).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				where: expect.objectContaining({
					type: { value: { in: ["MONTHLY", "SUCCESS"] } },
					contract: expect.objectContaining({
						legalArea: { value: { in: ["SOCIAL_SECURITY", "CIVIL"] } },
					}),
				}),
			}),
		);
		expect(prismaMock.remuneration.findMany).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				where: expect.objectContaining({
					fee: {
						revenue: {
							type: {
								value: { in: ["MONTHLY", "SUCCESS"] },
							},
						},
					},
					contractEmployee: {
						contract: {
							legalArea: {
								value: { in: ["SOCIAL_SECURITY", "CIVIL"] },
							},
						},
					},
				}),
			}),
		);
		expect(prismaMock.expense.findMany).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				where: expect.objectContaining({
					firmId: 1,
					deletedAt: null,
					isActive: true,
					expenseDate: {
						gte: new Date("2026-01-01T00:00:00.000Z"),
						lte: new Date("2026-12-31T23:59:59.999Z"),
					},
				}),
			}),
		);
	});

	it("returns an empty overdue-installments table when every due installment is recorded", async () => {
		prismaMock.revenue.findMany
			.mockResolvedValueOnce([
				{
					id: 1,
					totalValue: "1200",
					downPaymentValue: "0",
					paymentStartDate: new Date("2026-01-10T00:00:00.000Z"),
					totalInstallments: 2,
					type: { label: "Administrativo", value: "ADMINISTRATIVE" },
					contract: {
						processNumber: "PROC-3",
						client: {
							fullName: "Cliente C",
						},
						legalArea: { label: "Família", value: "FAMILY" },
						assignments: [
							{
								employee: { fullName: "João Souza" },
								assignmentType: { value: "RESPONSIBLE" },
							},
						],
					},
					fees: [
						{
							amount: "600",
							paymentDate: new Date("2026-02-10T00:00:00.000Z"),
							installmentNumber: 1,
						},
						{
							amount: "600",
							paymentDate: new Date("2026-03-10T00:00:00.000Z"),
							installmentNumber: 2,
						},
					],
				},
			])
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([]);
		prismaMock.fee.findMany
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([]);
		prismaMock.remuneration.findMany
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([]);
		prismaMock.expense.findMany
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([]);

		const result = await getDashboardSummary({
			firmId: 1,
			isAdmin: true,
			search: {
				dateFrom: "2026-01-01",
				dateTo: "2026-04-30",
				employeeId: "",
				legalArea: [],
				revenueType: [],
			},
		});

		expect(result.overdueInstallments).toEqual([]);
	});

	it("loads dashboard employee options from active non-deleted employees", async () => {
		prismaMock.employee.findMany.mockResolvedValue([
			{ id: 10, fullName: "Maria Silva" },
		]);

		await expect(getDashboardEmployeeOptions({ firmId: 1 })).resolves.toEqual([
			{
				id: 10,
				value: "10",
				label: "Maria Silva",
				isDisabled: false,
			},
		]);
		expect(prismaMock.employee.findMany).toHaveBeenCalledWith({
			where: {
				firmId: 1,
				deletedAt: null,
				isActive: true,
			},
			orderBy: [{ fullName: "asc" }, { id: "asc" }],
			select: {
				id: true,
				fullName: true,
			},
		});
	});
});
