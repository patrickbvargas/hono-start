import { describe, expect, it, vi } from "vitest";
import { seedExpenseGeneration } from "../../../../prisma/seed-expense-generation";
import type { SeedTransaction } from "../../../../prisma/seed-financial-fixtures";

function database(existing = false) {
	return {
		auditLog: {
			findFirst: vi.fn().mockResolvedValue({ id: 1 }),
			create: vi.fn(),
		},
		supplierProfile: {
			findFirstOrThrow: vi.fn().mockResolvedValue({
				id: 30,
				person: { fullName: "Fornecedor Teste" },
			}),
		},
		firm: {
			findMany: vi.fn().mockResolvedValue([
				{ id: 1, name: "Matriz" },
				{ id: 2, name: "Filial" },
			]),
		},
		expense: {
			findFirst: vi.fn().mockResolvedValue(existing ? { id: 9 } : null),
			create: vi.fn().mockResolvedValue({ id: 10 }),
		},
	};
}

describe("expense generation seed", () => {
	it("refuses non-demo databases before creating data", async () => {
		const tx = database();
		tx.auditLog.findFirst.mockResolvedValue(null);
		await expect(
			seedExpenseGeneration(tx as unknown as SeedTransaction),
		).rejects.toThrow("banco demonstrativo");
		expect(tx.supplierProfile.findFirstOrThrow).not.toHaveBeenCalled();
		expect(tx.expense.create).not.toHaveBeenCalled();
	});
	it("creates active, unbridged expenses with audit and a financial link per demo firm", async () => {
		const tx = database();
		const result = await seedExpenseGeneration(
			tx as unknown as SeedTransaction,
		);
		expect(tx.expense.create).toHaveBeenCalledTimes(2);
		expect(tx.expense.create).toHaveBeenCalledWith({
			data: expect.objectContaining({
				firmId: 1,
				supplierId: 30,
				negotiatedAmount: "1000.00",
				isActive: true,
			}),
			select: { id: true },
		});
		expect(tx.supplierProfile.findFirstOrThrow).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					isActive: true,
					person: { isActive: true, deletedAt: null, isGeneric: false },
				},
			}),
		);
		expect(tx.auditLog.create).toHaveBeenCalledTimes(2);
		expect(result[0]).toMatchObject({
			firmId: 1,
			url: "/despesas/10?tab=financial",
		});
	});
	it("reuses an unused fixture and never rewrites already generated financial history", async () => {
		const tx = database(true);
		await seedExpenseGeneration(tx as unknown as SeedTransaction);
		expect(tx.expense.findFirst).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					expensePayables: { none: {} },
					deletedAt: null,
					isActive: true,
				}),
			}),
		);
		expect(tx.expense.create).not.toHaveBeenCalled();
		expect(tx.auditLog.create).not.toHaveBeenCalled();
	});
	it("creates a fresh fixture after the previous one is consumed", async () => {
		const tx = database(true);
		tx.expense.findFirst.mockResolvedValueOnce(null);
		await seedExpenseGeneration(tx as unknown as SeedTransaction);
		expect(tx.expense.create).toHaveBeenCalledOnce();
	});
	it("rejects a missing demo firm without writes", async () => {
		const tx = database();
		tx.firm.findMany.mockResolvedValue([]);
		await expect(
			seedExpenseGeneration(tx as unknown as SeedTransaction),
		).rejects.toThrow("filial demonstrativa");
		expect(tx.expense.create).not.toHaveBeenCalled();
	});
});
