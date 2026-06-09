import {
	type AuditLogActor,
	buildAuditUpdateChangeData,
	createAuditLog,
} from "@/features/audit-logs/data/mutations";
import { prisma } from "@/shared/lib/prisma";
import type { MutationReturnType } from "@/shared/types/api";
import type {
	EntityInputParams,
	EntityUniqueParams,
} from "@/shared/types/entity";
import {
	assertExpenseCategoryCanBeSelected,
	assertExpenseCategoryExists,
} from "../rules/lookups";
import type { ExpenseCreateInput, ExpenseUpdateInput } from "../schemas/form";
import {
	normalizeExpenseCategoryValue,
	normalizeExpenseNotes,
} from "../utils/normalization";
import { getExpenseById, getExpenseCategoryByValue } from "./queries";

export async function createExpense({
	actor,
	firmId,
	input,
}: EntityInputParams<ExpenseCreateInput> & {
	actor?: AuditLogActor;
}): Promise<MutationReturnType> {
	const category = await getExpenseCategoryByValue(
		normalizeExpenseCategoryValue(input.category),
	);

	assertExpenseCategoryExists(category);
	assertExpenseCategoryCanBeSelected(category);

	await prisma.$transaction(async (tx) => {
		const expense = await tx.expense.create({
			data: {
				firmId,
				categoryId: category.id,
				expenseDate: new Date(`${input.expenseDate}T12:00:00.000Z`),
				amount: input.amount,
				notes: normalizeExpenseNotes(input.notes) || null,
				isActive: input.isActive,
			},
		});

		await createAuditLog(tx, {
			firmId,
			actor,
			action: "CREATE",
			entityType: "Expense",
			entityId: expense.id,
			entityName: `${category.label} #${expense.id}`,
			changeData: input,
			description: `Created expense ${expense.id}.`,
		});
	});

	return { success: true };
}

export async function updateExpense({
	actor,
	firmId,
	input,
}: EntityInputParams<ExpenseUpdateInput> & {
	actor?: AuditLogActor;
}): Promise<MutationReturnType> {
	const before = await getExpenseById({ firmId, id: input.id });
	const category = await getExpenseCategoryByValue(
		normalizeExpenseCategoryValue(input.category),
	);

	assertExpenseCategoryExists(category);
	assertExpenseCategoryCanBeSelected(category, before.categoryId);

	await prisma.$transaction(async (tx) => {
		await tx.expense.update({
			where: { id: input.id },
			data: {
				categoryId: category.id,
				expenseDate: new Date(`${input.expenseDate}T12:00:00.000Z`),
				amount: input.amount,
				notes: normalizeExpenseNotes(input.notes) || null,
				isActive: input.isActive,
				deletedAt: null,
			},
		});

		await createAuditLog(tx, {
			firmId,
			actor,
			action: "UPDATE",
			entityType: "Expense",
			entityId: input.id,
			entityName: `${category.label} #${input.id}`,
			changeData: buildAuditUpdateChangeData({
				before,
				after: input,
			}),
			description: `Updated expense ${input.id}.`,
		});
	});

	return { success: true };
}

export async function deleteExpense({
	actor,
	firmId,
	id,
}: EntityUniqueParams & {
	actor?: AuditLogActor;
}): Promise<MutationReturnType> {
	const before = await getExpenseById({ firmId, id });

	await prisma.$transaction(async (tx) => {
		await tx.expense.update({
			where: { id },
			data: { deletedAt: new Date() },
		});

		await createAuditLog(tx, {
			firmId,
			actor,
			action: "DELETE",
			entityType: "Expense",
			entityId: id,
			entityName: `${before.category} #${id}`,
			changeData: { before },
			description: `Deleted expense ${id}.`,
		});
	});

	return { success: true };
}

export async function restoreExpense({
	actor,
	firmId,
	id,
}: EntityUniqueParams & {
	actor?: AuditLogActor;
}): Promise<MutationReturnType> {
	const before = await getExpenseById({ firmId, id });

	await prisma.$transaction(async (tx) => {
		await tx.expense.update({
			where: { id },
			data: { deletedAt: null },
		});

		await createAuditLog(tx, {
			firmId,
			actor,
			action: "RESTORE",
			entityType: "Expense",
			entityId: id,
			entityName: `${before.category} #${id}`,
			changeData: { before },
			description: `Restored expense ${id}.`,
		});
	});

	return { success: true };
}
