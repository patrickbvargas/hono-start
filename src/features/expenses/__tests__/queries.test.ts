import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@/generated/prisma/client";

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
	getExpenseFinancial,
	getExpenseSuppliers,
	getExpenses,
} from "../data/queries";

describe("expense queries", () => {
	it("maps actual linked titles with exact principal balances and scoped unreversed payments", async () => {
		const title = (
			id: number,
			amount: string,
			kind = "INSTALLMENT",
			cancelledAt: Date | null = null,
		) => ({
			id,
			amount: new Prisma.Decimal(amount),
			dueDate: new Date("2026-12-01"),
			kind,
			cancelledAt,
			payments: [],
		});
		prismaMock.expense.findFirst.mockResolvedValue({
			expensePayables: [
				{ payable: title(3, "0.20", "EXTRA") },
				{
					payable: {
						...title(1, "100.10", "DOWN_PAYMENT"),
						payments: [
							{
								principalAbated: new Prisma.Decimal("100.10"),
								effectiveAmount: new Prisma.Decimal("90.10"),
								effectiveDate: new Date("2026-11-02"),
							},
						],
					},
				},
				{
					payable: {
						...title(2, "100.20"),
						payments: [
							{
								principalAbated: new Prisma.Decimal("20.10"),
								effectiveAmount: new Prisma.Decimal("25.10"),
								effectiveDate: new Date("2026-11-03"),
							},
							{
								principalAbated: new Prisma.Decimal("10.10"),
								effectiveAmount: new Prisma.Decimal("10.10"),
								effectiveDate: new Date("2026-11-01"),
							},
						],
					},
				},
				{ payable: title(4, "500", "INSTALLMENT", new Date()) },
			],
		});
		const result = await getExpenseFinancial({ firmId: 7, id: 9 });
		expect(result.paidAmount).toBe(125.3);
		expect(result.remainingAmount).toBe(70.2);
		expect(result.installments.map((row) => row.id)).toEqual([1, 2, 3, 4]);
		expect(result.installments[0]).toMatchObject({
			remainingAmount: 0,
			paidAmount: 90.1,
			kind: "DOWN_PAYMENT",
		});
		expect(result.installments[1]).toMatchObject({
			remainingAmount: 70,
			principalAbated: 30.2,
			paymentDate: "2026-11-03",
		});
		expect(result.installments[3]).toMatchObject({
			remainingAmount: 0,
			isCancelled: true,
		});
		expect(prismaMock.expense.findFirst).toHaveBeenCalledWith(
			expect.objectContaining({ where: { id: 9, firmId: 7 } }),
		);
		const query = prismaMock.expense.findFirst.mock.calls.at(-1)?.[0];
		expect(query.select.expensePayables.where).toEqual({ firmId: 7 });
		expect(
			query.select.expensePayables.select.payable.select.payments.where,
		).toEqual({ firmId: 7, reversal: null });
	});
	it("rejects a missing or other-firm financial source", async () => {
		prismaMock.expense.findFirst.mockResolvedValue(null);
		await expect(getExpenseFinancial({ firmId: 7, id: 9 })).rejects.toThrow(
			"Despesa não encontrada",
		);
	});
	it("shows zero debt before any titles are generated", async () => {
		prismaMock.expense.findFirst.mockResolvedValue({ expensePayables: [] });
		await expect(getExpenseFinancial({ firmId: 7, id: 9 })).resolves.toEqual({
			paidAmount: 0,
			remainingAmount: 0,
			installments: [],
		});
	});
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
			_count: { expensePayables: 2 },
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
			hasGeneratedTitles: true,
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
