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
	assertSupplierCanBeSelected,
	assertSupplierExists,
} from "../rules/lookups";
import { assertExpenseAmountPositive } from "../rules/write";
import type { ExpenseCreateInput, ExpenseUpdateInput } from "../schemas/form";
import { normalizeExpenseNotes } from "../utils/normalization";
import { getExpenseById, getSupplierProfileById } from "./queries";

export async function createExpense({
	actor,
	firmId,
	input,
}: EntityInputParams<ExpenseCreateInput> & {
	actor?: AuditLogActor;
}): Promise<MutationReturnType> {
	const supplierId = Number(input.supplierId);
	const supplier = await getSupplierProfileById(supplierId);

	assertSupplierExists(supplier);
	assertSupplierCanBeSelected(supplier);
	assertExpenseAmountPositive(input.negotiatedAmount);

	await prisma.$transaction(async (tx) => {
		const expense = await tx.expense.create({
			data: {
				firmId,
				supplierId: supplier.id,
				negotiatedAmount: input.negotiatedAmount,
				notes: normalizeExpenseNotes(input.notes),
				isActive: input.isActive,
			},
		});

		await createAuditLog(tx, {
			firmId,
			actor,
			action: "CREATE",
			entityType: "Expense",
			entityId: expense.id,
			entityName: `${supplier.person.fullName} #${expense.id}`,
			changeData: input,
			description: `Criou despesa ${expense.id}.`,
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
	const supplierId = Number(input.supplierId);
	const supplier = await getSupplierProfileById(supplierId);

	assertSupplierExists(supplier);
	assertSupplierCanBeSelected(supplier, before.supplierId);
	assertExpenseAmountPositive(input.negotiatedAmount);

	await prisma.$transaction(async (tx) => {
		await tx.expense.update({
			where: { id: input.id },
			data: {
				supplierId: supplier.id,
				negotiatedAmount: input.negotiatedAmount,
				notes: normalizeExpenseNotes(input.notes),
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
			entityName: `${supplier.person.fullName} #${input.id}`,
			changeData: buildAuditUpdateChangeData({
				before,
				after: input,
			}),
			description: `Atualizou despesa ${input.id}.`,
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
			entityName: `${before.supplierName} #${id}`,
			changeData: { before },
			description: `Excluiu despesa ${id}.`,
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
			entityName: `${before.supplierName} #${id}`,
			changeData: { before },
			description: `Restaurou despesa ${id}.`,
		});
	});

	return { success: true };
}
