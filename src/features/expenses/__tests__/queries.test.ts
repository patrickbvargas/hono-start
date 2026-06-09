import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
	expense: {
		count: vi.fn(),
		findFirst: vi.fn(),
		findMany: vi.fn(),
	},
	expenseCategory: {
		findMany: vi.fn(),
	},
}));

vi.mock("@/shared/lib/prisma", () => ({
	prisma: prismaMock,
}));

import {
	getExpenseById,
	getExpenseCategories,
	getExpenses,
} from "../data/queries";

describe("expense queries", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("lists expenses with category and observation filters", async () => {
		prismaMock.expense.count.mockResolvedValue(1);
		prismaMock.expense.findMany.mockResolvedValue([
			{
				id: 5,
				amount: { toString: () => "150.25", valueOf: () => 150.25 },
				expenseDate: new Date("2026-06-09T00:00:00.000Z"),
				isActive: true,
				deletedAt: null,
				createdAt: new Date("2026-06-09T10:00:00.000Z"),
				category: {
					id: 2,
					label: "Telefone",
					value: "PHONE",
				},
			},
		]);

		const result = await getExpenses({
			firmId: 1,
			search: {
				page: 1,
				limit: 25,
				column: "expenseDate",
				direction: "desc",
				query: "principal",
				category: "PHONE",
				dateFrom: "2026-06-01",
				dateTo: "2026-06-30",
				active: "all",
				status: "active",
			},
		});

		expect(prismaMock.expense.findMany).toHaveBeenCalled();
		expect(result.total).toBe(1);
		expect(result.data[0]).toMatchObject({
			id: 5,
			category: "Telefone",
			categoryValue: "PHONE",
			amount: 150.25,
		});
	});

	it("loads expense details", async () => {
		prismaMock.expense.findFirst.mockResolvedValue({
			id: 7,
			amount: { toString: () => "990.5", valueOf: () => 990.5 },
			expenseDate: new Date("2026-06-09T00:00:00.000Z"),
			notes: "Conta fixa",
			isActive: true,
			deletedAt: null,
			createdAt: new Date("2026-06-09T10:00:00.000Z"),
			updatedAt: new Date("2026-06-09T11:00:00.000Z"),
			category: {
				id: 3,
				label: "Condomínio",
				value: "CONDOMINIUM",
			},
		});

		const result = await getExpenseById({ firmId: 1, id: 7 });

		expect(result).toMatchObject({
			id: 7,
			category: "Condomínio",
			categoryValue: "CONDOMINIUM",
			notes: "Conta fixa",
		});
	});

	it("returns all expense categories as options", async () => {
		prismaMock.expenseCategory.findMany.mockResolvedValue([
			{ id: 1, value: "PHONE", label: "Telefone", isActive: true },
			{ id: 2, value: "OTHER", label: "Outros", isActive: false },
		]);

		const result = await getExpenseCategories();

		expect(result).toEqual([
			{ id: 1, value: "PHONE", label: "Telefone", isDisabled: false },
			{ id: 2, value: "OTHER", label: "Outros", isDisabled: true },
		]);
	});
});
