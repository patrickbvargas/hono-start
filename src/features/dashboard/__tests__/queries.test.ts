import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		client: {
			count: vi.fn(),
			findMany: vi.fn(),
		},
		contract: {
			count: vi.fn(),
			findMany: vi.fn(),
		},
		revenue: {
			findMany: vi.fn(),
		},
		fee: {
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

	it("builds admin summary totals, comparisons, grouped revenue, and recent activity", async () => {
		prismaMock.revenue.findMany
			.mockResolvedValueOnce([
				{
					totalValue: "1000",
					downPaymentValue: "100",
					paymentStartDate: new Date("2026-01-05T00:00:00.000Z"),
					type: { label: "Mensal", value: "MONTHLY" },
					contract: {
						legalArea: { label: "Previdenciário", value: "SOCIAL_SECURITY" },
					},
					fees: [
						{
							amount: "200",
							paymentDate: new Date("2026-01-21T00:00:00.000Z"),
						},
					],
				},
				{
					totalValue: "500",
					downPaymentValue: "50",
					paymentStartDate: new Date("2025-12-20T00:00:00.000Z"),
					type: { label: "Êxito", value: "SUCCESS" },
					contract: {
						legalArea: { label: "Cível", value: "CIVIL" },
					},
					fees: [
						{
							amount: "100",
							paymentDate: new Date("2026-01-12T00:00:00.000Z"),
						},
					],
				},
			])
			.mockResolvedValueOnce([
				{
					downPaymentValue: "100",
					paymentStartDate: new Date("2026-01-05T00:00:00.000Z"),
				},
				{
					downPaymentValue: "50",
					paymentStartDate: new Date("2026-01-10T00:00:00.000Z"),
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
					paymentDate: new Date("2026-01-12T00:00:00.000Z"),
				},
			])
			.mockResolvedValueOnce([
				{
					id: 30,
					amount: "200",
					paymentDate: new Date("2026-01-21T00:00:00.000Z"),
					revenue: {
						contract: {
							processNumber: "PROC-001",
							client: { fullName: "Cliente A" },
						},
					},
				},
			]);
		prismaMock.remuneration.findMany
			.mockResolvedValueOnce([{ amount: "60" }, { amount: "40" }])
			.mockResolvedValueOnce([{ amount: "60" }])
			.mockResolvedValueOnce([{ amount: "20" }])
			.mockResolvedValueOnce([
				{
					amount: "60",
					paymentDate: new Date("2026-01-22T00:00:00.000Z"),
				},
				{
					amount: "40",
					paymentDate: new Date("2026-01-11T00:00:00.000Z"),
				},
			])
			.mockResolvedValueOnce([
				{
					id: 40,
					amount: "60",
					paymentDate: new Date("2026-01-22T00:00:00.000Z"),
					contractEmployee: {
						employee: { fullName: "Maria Silva" },
						contract: { processNumber: "PROC-001" },
					},
				},
			]);
		prismaMock.client.findMany.mockResolvedValue([
			{
				id: 1,
				fullName: "Cliente B",
				updatedAt: new Date("2026-01-20T00:00:00.000Z"),
			},
		]);
		prismaMock.contract.findMany.mockResolvedValue([
			{
				id: 5,
				processNumber: "PROC-001",
				updatedAt: new Date("2026-01-19T00:00:00.000Z"),
				client: { fullName: "Cliente A" },
			},
		]);

		const result = await getDashboardSummary({
			firmId: 1,
			isAdmin: true,
			search: {
				dateFrom: "2026-01-01",
				dateTo: "2026-01-31",
				employeeId: "",
				legalArea: "",
				revenueType: "",
			},
		});

		expect(result.scopeLabel).toBe("Visão da firma");
		expect(result.metrics).toEqual([
			expect.objectContaining({
				label: "Receita prevista",
				value: 1000,
				currentValue: 1000,
				previousValue: 0,
				previousLabel: "Período anterior",
				previousPeriodLabel: "01/01/2025 a 31/01/2025",
				changePercent: 100,
			}),
			expect.objectContaining({
				label: "Receita recebida",
				value: 400,
				currentValue: 300,
				previousValue: 50,
				previousLabel: "Período anterior",
				previousPeriodLabel: "01/01/2025 a 31/01/2025",
				changePercent: 500,
			}),
			expect.objectContaining({
				label: "Remunerações",
				value: 100,
				currentValue: 60,
				previousValue: 20,
				previousLabel: "Período anterior",
				previousPeriodLabel: "01/01/2025 a 31/01/2025",
				changePercent: 200,
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
		expect(result.financialEvolutionLabel).toBe("Jan/2026 a Jan/2026");
		expect(result.financialEvolution).toEqual([
			{
				month: "2026-01",
				revenue: 450,
				remuneration: 100,
			},
		]);
		expect(result.recentActivity.map((item) => item.type)).toEqual([
			"remuneration",
			"fee",
			"client",
			"contract",
		]);
	});

	it("keeps regular users scoped to assigned-contract and own-remuneration data", async () => {
		prismaMock.revenue.findMany.mockResolvedValue([]).mockResolvedValueOnce([]);
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
		prismaMock.client.findMany.mockResolvedValue([]);
		prismaMock.contract.findMany.mockResolvedValue([]);

		const result = await getDashboardSummary({
			firmId: 1,
			employeeId: 10,
			isAdmin: false,
			search: {
				dateFrom: "2026-01-01",
				dateTo: "2026-12-31",
				employeeId: "999",
				legalArea: "",
				revenueType: "",
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
	});

	it("applies legal area and revenue type filters to revenue-scoped dashboard data", async () => {
		prismaMock.revenue.findMany.mockResolvedValue([]).mockResolvedValueOnce([]);
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
		prismaMock.client.findMany.mockResolvedValue([]);
		prismaMock.contract.findMany.mockResolvedValue([]);

		await getDashboardSummary({
			firmId: 1,
			isAdmin: true,
			search: {
				dateFrom: "2026-01-01",
				dateTo: "2026-12-31",
				employeeId: "",
				legalArea: "SOCIAL_SECURITY",
				revenueType: "MONTHLY",
			},
		});

		expect(prismaMock.revenue.findMany).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				where: expect.objectContaining({
					type: { value: "MONTHLY" },
					contract: expect.objectContaining({
						legalArea: { value: "SOCIAL_SECURITY" },
					}),
				}),
			}),
		);
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
