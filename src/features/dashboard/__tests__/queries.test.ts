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
		prismaMock.client.count.mockResolvedValue(2);
		prismaMock.contract.count.mockResolvedValue(1);
		prismaMock.revenue.findMany.mockResolvedValue([
			{
				totalValue: "1000",
				downPaymentValue: "100",
				paymentStartDate: new Date("2026-01-05T00:00:00.000Z"),
				type: { label: "Mensal", value: "MONTHLY" },
				contract: {
					legalArea: { label: "Previdenciário", value: "SOCIAL_SECURITY" },
				},
				fees: [{ amount: "200" }],
			},
			{
				totalValue: "500",
				downPaymentValue: "50",
				paymentStartDate: new Date("2025-12-20T00:00:00.000Z"),
				type: { label: "Êxito", value: "SUCCESS" },
				contract: {
					legalArea: { label: "Cível", value: "CIVIL" },
				},
				fees: [{ amount: "100" }],
			},
		]);
		prismaMock.fee.findMany
			.mockResolvedValueOnce([{ amount: "200" }, { amount: "100" }])
			.mockResolvedValueOnce([{ amount: "50" }])
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
			},
		});

		expect(result.scopeLabel).toBe("Visão da firma");
		expect(result.metrics).toEqual([
			expect.objectContaining({ label: "Receita prevista", value: 1500 }),
			expect.objectContaining({ label: "Receita recebida", value: 400 }),
			expect.objectContaining({ label: "Remunerações", value: 100 }),
			expect.objectContaining({ label: "Contratos ativos", value: 1 }),
		]);
		expect(result.comparisons).toEqual([
			expect.objectContaining({
				label: "Receita do período",
				currentValue: 300,
				previousValue: 50,
				changePercent: 500,
			}),
			expect.objectContaining({
				label: "Remuneração do período",
				currentValue: 60,
				previousValue: 20,
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
		expect(result.recentActivity.map((item) => item.type)).toEqual([
			"remuneration",
			"fee",
			"client",
			"contract",
		]);
	});

	it("keeps regular users scoped to assigned-contract and own-remuneration data", async () => {
		prismaMock.client.count.mockResolvedValue(0);
		prismaMock.contract.count.mockResolvedValue(0);
		prismaMock.revenue.findMany.mockResolvedValue([]);
		prismaMock.fee.findMany
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([]);
		prismaMock.remuneration.findMany
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
				dateFrom: "",
				dateTo: "",
				employeeId: "999",
			},
		});

		expect(prismaMock.contract.count).toHaveBeenCalledWith({
			where: expect.objectContaining({
				assignments: {
					some: {
						firmId: 1,
						employeeId: 10,
						deletedAt: null,
						isActive: true,
					},
				},
			}),
		});
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
