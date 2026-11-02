import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupplierProfile } from "@/generated/prisma/client";
import type { ExpenseDetail } from "../schemas/model";

const {
	createAuditLogMock,
	getExpenseByIdMock,
	getSupplierProfileByIdMock,
	prismaMock,
} = vi.hoisted(() => ({
	createAuditLogMock: vi.fn(),
	getExpenseByIdMock: vi.fn(),
	getSupplierProfileByIdMock: vi.fn(),
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
		getSupplierProfileById: getSupplierProfileByIdMock,
	};
});

import { EXPENSE_ERRORS } from "../constants/errors";
import {
	createExpense,
	deleteExpense,
	restoreExpense,
	updateExpense,
} from "../data/mutations";

const baseSupplier = (
	overrides: Partial<
		SupplierProfile & {
			person: { fullName: string; document: string | null };
		}
	> = {},
) => ({
	id: 30,
	personId: 100,
	isActive: true,
	createdAt: new Date(),
	updatedAt: new Date(),
	person: {
		fullName: "Fornecedor Teste",
		document: "12345678901",
	},
	...overrides,
});

const baseExpense = (
	overrides: Partial<ExpenseDetail> = {},
): ExpenseDetail => ({
	id: 1,
	supplierId: 30,
	supplierName: "Fornecedor Teste",
	supplierDocument: "12345678901",
	negotiatedAmount: 100,
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
		prismaMock.$transaction.mockImplementation(
			async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
				callback(prismaMock),
		);
	});

	it("rejects unknown suppliers on create", async () => {
		getSupplierProfileByIdMock.mockResolvedValue(null);

		await expect(
			createExpense({
				firmId: 1,
				input: {
					supplierId: "999",
					negotiatedAmount: 100,
					notes: "",
					isActive: true,
				},
			}),
		).rejects.toThrow(EXPENSE_ERRORS.SUPPLIER_NOT_FOUND);
	});

	it("creates expenses inside a transaction and writes an audit log", async () => {
		getSupplierProfileByIdMock.mockResolvedValue(baseSupplier());

		await expect(
			createExpense({
				actor: {
					id: 10,
					name: "Admin",
					email: "admin@example.com",
				},
				firmId: 1,
				input: {
					supplierId: "30",
					negotiatedAmount: 150.5,
					notes: "  Conta principal  ",
					isActive: true,
				},
			}),
		).resolves.toEqual({ success: true });

		expect(prismaMock.expense.create).toHaveBeenCalledWith({
			data: {
				firmId: 1,
				supplierId: 30,
				negotiatedAmount: 150.5,
				notes: "Conta principal",
				isActive: true,
			},
		});
		expect(createAuditLogMock).toHaveBeenCalledWith(
			prismaMock,
			expect.objectContaining({
				action: "CREATE",
				entityType: "Expense",
				description: "Criou despesa 9.",
			}),
		);
	});

	it("allows unchanged inactive persisted suppliers on update", async () => {
		getExpenseByIdMock.mockResolvedValue(baseExpense());
		getSupplierProfileByIdMock.mockResolvedValue(
			baseSupplier({ isActive: false }),
		);

		await expect(
			updateExpense({
				firmId: 1,
				input: {
					id: 1,
					supplierId: "30",
					negotiatedAmount: 200,
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
