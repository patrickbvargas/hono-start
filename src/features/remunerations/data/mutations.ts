import { prisma } from "@/shared/lib/prisma";
import type { MutationReturnType } from "@/shared/types/api";
import { REMUNERATION_ERRORS } from "../constants/errors";
import type { RemunerationUpdateInput } from "../schemas/form";
import type { getRemunerationAccessResourceById } from "./queries";

type RemunerationAccess = NonNullable<
	Awaited<ReturnType<typeof getRemunerationAccessResourceById>>
>;

export async function updateRemuneration({
	access,
	input,
}: {
	access: RemunerationAccess;
	input: RemunerationUpdateInput;
}): Promise<MutationReturnType> {
	if (access.deletedAt) {
		throw new Error(REMUNERATION_ERRORS.REMUNERATION_EDIT_DELETED);
	}

	if (access.parentFeeIsSoftDeleted) {
		throw new Error(REMUNERATION_ERRORS.REMUNERATION_EDIT_PARENT_DELETED);
	}

	await prisma.remuneration.update({
		where: { id: input.id },
		data: {
			amount: input.amount,
			effectivePercentage: input.effectivePercentage,
			isSystemGenerated: false,
		},
	});

	return { success: true };
}

export async function deleteRemuneration(
	id: number,
): Promise<MutationReturnType> {
	await prisma.remuneration.update({
		where: { id },
		data: {
			deletedAt: new Date(),
		},
	});

	return { success: true };
}

export async function restoreRemuneration({
	access,
	id,
}: {
	access: RemunerationAccess;
	id: number;
}): Promise<MutationReturnType> {
	if (access.parentFeeIsSoftDeleted) {
		throw new Error(REMUNERATION_ERRORS.REMUNERATION_RESTORE_PARENT_DELETED);
	}

	await prisma.remuneration.update({
		where: { id },
		data: {
			deletedAt: null,
		},
	});

	return { success: true };
}
