import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
	expense: {
		aggregate: vi.fn(),
		count: vi.fn(),
		findFirst: vi.fn(),
		findMany: vi.fn(),
	},
	supplierProfile: {
		findMany: vi.fn(),
		findUnique: vi.fn(),
	},
}));

vi.mock("@/shared/lib/prisma", () => ({
	prisma: prismaMock,
}));

import {
	getExpenseById,
	getExpenseSuppliers,
	getExpenses,
} from "../data/queries";

describe("expense queries", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		prismaMock.expense.aggregate.mockResolvedValue({
			_sum: { negotiatedAmount: "9876.54" },
		});
	});

	it("lists expenses with supplier and observation filters", async () => {
		prismaMock.expense.count.mockResolvedValue(1);
		prismaMock.expense.findMany.mockResolvedValue([
			{
				id: 5,
				negotiatedAmount: { toString: () => "150.25", valueOf: () => 150.25 },
				notes: "Conta principal",
				isActive: true,
				deletedAt: null,
				createdAt: new Date("2026-06-09T10:00:00.000Z"),
				supplier: {
					id: 2,
					person: {
						fullName: "Papelaria Silva",
						document: "12345678901",
					},
				},
			},
		]);

		const result = await getExpenses({
			firmId: 1,
			search: {
				page: 1,
				limit: 25,
				column: "createdAt",
				direction: "desc",
				query: "principal",
				supplierId: 2,
				dateFrom: "2026-06-01",
				dateTo: "2026-06-30",
				active: "all",
				status: "active",
			},
		});

		expect(prismaMock.expense.findMany).toHaveBeenCalled();
		expect(result.totalAmount).toBe(9876.54);
		expect(prismaMock.expense.aggregate).toHaveBeenCalledWith({
			where: prismaMock.expense.findMany.mock.calls[0]?.[0].where,
			_sum: { negotiatedAmount: true },
		});
		expect(result.total).toBe(1);
		expect(result.data[0]).toMatchObject({
			id: 5,
			supplierId: 2,
			supplierName: "Papelaria Silva",
			supplierDocument: "12345678901",
			negotiatedAmount: 150.25,
		});
	});

	it("loads expense details", async () => {
		prismaMock.expense.findFirst.mockResolvedValue({
			id: 7,
			negotiatedAmount: { toString: () => "990.5", valueOf: () => 990.5 },
			notes: "Conta fixa",
			isActive: true,
			deletedAt: null,
			createdAt: new Date("2026-06-09T10:00:00.000Z"),
			updatedAt: new Date("2026-06-09T11:00:00.000Z"),
			supplier: {
				id: 3,
				person: {
					fullName: "Serviços Contábeis",
					document: null,
				},
			},
		});

		const result = await getExpenseById({ firmId: 1, id: 7 });

		expect(result).toMatchObject({
			id: 7,
			supplierId: 3,
			supplierName: "Serviços Contábeis",
			notes: "Conta fixa",
			negotiatedAmount: 990.5,
		});
	});

	it("returns all active suppliers as options", async () => {
		prismaMock.supplierProfile.findMany.mockResolvedValue([
			{
				id: 1,
				isActive: true,
				person: { fullName: "Fornecedor A", document: "111", isActive: true },
			},
			{
				id: 2,
				isActive: false,
				person: { fullName: "Fornecedor B", document: null, isActive: true },
			},
		]);

		const result = await getExpenseSuppliers();

		expect(result).toEqual([
			{ id: 1, value: "1", label: "Fornecedor A", isDisabled: false },
			{ id: 2, value: "2", label: "Fornecedor B", isDisabled: true },
		]);
	});
});
