import type { AuditLogActor } from "@/features/audit-logs/data/mutations";
import { createAuditLog } from "@/features/audit-logs/data/mutations";
import { prisma } from "@/shared/lib/prisma";
import type { MutationReturnType } from "@/shared/types/api";
import { REMUNERATION_ERRORS } from "../constants/errors";
import type { RemunerationUpdateInput } from "../schemas/form";
import type { getRemunerationAccessResourceById } from "./queries";

type RemunerationAccess = NonNullable<
	Awaited<ReturnType<typeof getRemunerationAccessResourceById>>
>;

export async function updateRemuneration({
	actor,
	access,
	input,
}: {
	actor?: AuditLogActor;
	access: RemunerationAccess;
	input: RemunerationUpdateInput;
}): Promise<MutationReturnType> {
	if (access.deletedAt) {
		throw new Error(REMUNERATION_ERRORS.REMUNERATION_EDIT_DELETED);
	}

	if (access.parentFeeIsSoftDeleted) {
		throw new Error(REMUNERATION_ERRORS.REMUNERATION_EDIT_PARENT_DELETED);
	}

	await prisma.$transaction(async (tx) => {
		await tx.remuneration.update({
			where: { id: input.id },
			data: {
				amount: input.amount,
				effectivePercentage: input.effectivePercentage,
				isSystemGenerated: false,
			},
		});

		await createAuditLog(tx, {
			firmId: access.resource.firmId,
			actor,
			action: "UPDATE",
			entityType: "Remuneration",
			entityId: input.id,
			entityName: `Remuneration ${input.id}`,
			changeData: input,
			description: `Updated remuneration ${input.id}.`,
		});
	});

	return { success: true };
}

export async function deleteRemuneration({
	actor,
	access,
	id,
}: {
	actor?: AuditLogActor;
	access: RemunerationAccess;
	id: number;
}): Promise<MutationReturnType> {
	await prisma.$transaction(async (tx) => {
		await tx.remuneration.update({
			where: { id },
			data: {
				deletedAt: new Date(),
			},
		});

		await createAuditLog(tx, {
			firmId: access.resource.firmId,
			actor,
			action: "DELETE",
			entityType: "Remuneration",
			entityId: id,
			entityName: `Remuneration ${id}`,
			changeData: { id },
			description: `Deleted remuneration ${id}.`,
		});
	});

	return { success: true };
}

export async function restoreRemuneration({
	actor,
	access,
	id,
}: {
	actor?: AuditLogActor;
	access: RemunerationAccess;
	id: number;
}): Promise<MutationReturnType> {
	if (access.parentFeeIsSoftDeleted) {
		throw new Error(REMUNERATION_ERRORS.REMUNERATION_RESTORE_PARENT_DELETED);
	}

	await prisma.$transaction(async (tx) => {
		await tx.remuneration.update({
			where: { id },
			data: {
				deletedAt: null,
			},
		});

		await createAuditLog(tx, {
			firmId: access.resource.firmId,
			actor,
			action: "RESTORE",
			entityType: "Remuneration",
			entityId: id,
			entityName: `Remuneration ${id}`,
			changeData: { id },
			description: `Restored remuneration ${id}.`,
		});
	});

	return { success: true };
}
