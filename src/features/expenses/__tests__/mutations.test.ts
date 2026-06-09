import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ExpenseCategory } from "@/generated/prisma/client";
import type { ExpenseDetail } from "../schemas/model";

const {
	createAuditLogMock,
	getExpenseByIdMock,
	getExpenseCategoryByValueMock,
	prismaMock,
} = vi.hoisted(() => ({
	createAuditLogMock: vi.fn(),
	getExpenseByIdMock: vi.fn(),
	getExpenseCategoryByValueMock: vi.fn(),
	prismaMock: {
		expense: {
			create: vi.fn(),
			update: vi.fn(),
		},
		$transaction: vi.fn(),
	},
}));

vi.mock("@/shared/lib/prisma", () => ({
	prisma: prismaMock,
}));

vi.mock("@/features/audit-logs/data/mutations", () => ({
	createAuditLog: createAuditLogMock,
	buildAuditUpdateChangeData: ({
		before,
		after,
	}: {
		before: unknown;
		after: unknown;
	}) => ({
		before,
		after,
	}),
}));

vi.mock("../data/queries", async () => {
	const actual = await vi.importActual("../data/queries");

	return {
		...actual,
		getExpenseById: getExpenseByIdMock,
		getExpenseCategoryByValue: getExpenseCategoryByValueMock,
	};
});

import { EXPENSE_ERRORS } from "../constants/errors";
import {
	createExpense,
	deleteExpense,
	restoreExpense,
	updateExpense,
} from "../data/mutations";

const baseCategory = (
	overrides: Partial<ExpenseCategory> = {},
): ExpenseCategory => ({
	id: 30,
	value: "PHONE",
	label: "Telefone",
	isActive: true,
	...overrides,
});

const baseExpense = (
	overrides: Partial<ExpenseDetail> = {},
): ExpenseDetail => ({
	id: 1,
	categoryId: 30,
	category: "Telefone",
	categoryValue: "PHONE",
	expenseDate: "2026-06-09T12:00:00.000Z",
	amount: 100,
	notes: "Conta fixa",
	isActive: true,
	isSoftDeleted: false,
	createdAt: "2026-06-09T10:00:00.000Z",
	updatedAt: "2026-06-09T11:00:00.000Z",
	...overrides,
});

describe("expense mutations", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		prismaMock.expense.create.mockResolvedValue({ id: 9 });
		prismaMock.expense.update.mockResolvedValue({});
		prismaMock.$transaction.mockImplementation(async (callback) =>
			callback(prismaMock),
		);
	});

	it("rejects unknown categories on create", async () => {
		getExpenseCategoryByValueMock.mockResolvedValue(null);

		await expect(
			createExpense({
				firmId: 1,
				input: {
					category: "UNKNOWN",
					expenseDate: "2026-06-09",
					amount: 100,
					notes: "",
					isActive: true,
				},
			}),
		).rejects.toThrow(EXPENSE_ERRORS.CATEGORY_NOT_FOUND);
	});

	it("creates expenses inside a transaction and writes an audit log", async () => {
		getExpenseCategoryByValueMock.mockResolvedValue(baseCategory());

		await expect(
			createExpense({
				actor: {
					id: 10,
					name: "Admin",
					email: "admin@example.com",
				},
				firmId: 1,
				input: {
					category: "PHONE",
					expenseDate: "2026-06-09",
					amount: 150.5,
					notes: "  Conta principal  ",
					isActive: true,
				},
			}),
		).resolves.toEqual({ success: true });

		expect(prismaMock.expense.create).toHaveBeenCalledWith({
			data: {
				firmId: 1,
				categoryId: 30,
				expenseDate: new Date("2026-06-09T12:00:00.000Z"),
				amount: 150.5,
				notes: "Conta principal",
				isActive: true,
			},
		});
		expect(createAuditLogMock).toHaveBeenCalled();
	});

	it("allows unchanged inactive persisted categories on update", async () => {
		getExpenseByIdMock.mockResolvedValue(baseExpense());
		getExpenseCategoryByValueMock.mockResolvedValue(
			baseCategory({ isActive: false }),
		);

		await expect(
			updateExpense({
				firmId: 1,
				input: {
					id: 1,
					category: "PHONE",
					expenseDate: "2026-06-10",
					amount: 200,
					notes: "",
					isActive: true,
				},
			}),
		).resolves.toEqual({ success: true });
	});

	it("soft-deletes and restores expenses", async () => {
		getExpenseByIdMock.mockResolvedValue(baseExpense());

		await expect(deleteExpense({ firmId: 1, id: 1 })).resolves.toEqual({
			success: true,
		});
		await expect(restoreExpense({ firmId: 1, id: 1 })).resolves.toEqual({
			success: true,
		});

		expect(prismaMock.expense.update).toHaveBeenCalledTimes(2);
	});
});
