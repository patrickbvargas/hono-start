import { prisma } from "@/shared/lib/prisma";
import type { MutationReturnType } from "@/shared/types/api";
import type {
	EntityInputParams,
	EntityUniqueParams,
} from "@/shared/types/entity";
import { assertCanBeDeleted } from "../rules/delete";
import { assertDocumentMatchesType } from "../rules/document";
import {
	assertTypeCanBeSelected,
	assertTypeExists,
	assertTypeImmutableOnUpdate,
} from "../rules/type";
import type { ClientCreateInput, ClientUpdateInput } from "../schemas/form";
import { findClientTypeByValue } from "./lookup";
import { countActiveContractsByClientId, requireById } from "./queries";

export async function create({
	firmId,
	input,
}: EntityInputParams<ClientCreateInput>): Promise<MutationReturnType> {
	const type = await findClientTypeByValue(input.type);

	assertTypeExists(type);
	assertTypeCanBeSelected(type);
	assertDocumentMatchesType(type.value, input.document);

	await prisma.client.create({
		data: {
			firmId,
			typeId: type.id,
			fullName: input.fullName,
			document: input.document,
			email: input.email,
			phone: input.phone,
			isActive: input.isActive,
		},
	});

	return { success: true };
}

export async function update({
	firmId,
	input,
}: EntityInputParams<ClientUpdateInput>): Promise<MutationReturnType> {
	const existing = await requireById({ firmId, id: input.id });

	const type = await findClientTypeByValue(input.type);

	assertTypeExists(type);
	assertTypeCanBeSelected(type, existing.typeId);
	assertTypeImmutableOnUpdate(type, existing.typeId);
	assertDocumentMatchesType(type.value, input.document);

	await prisma.client.update({
		where: { id: input.id },
		data: {
			fullName: input.fullName,
			document: input.document,
			email: input.email,
			phone: input.phone,
			isActive: input.isActive,
		},
	});

	return { success: true };
}

export async function remove({
	firmId,
	id,
}: EntityUniqueParams): Promise<MutationReturnType> {
	await requireById({ firmId, id });

	const activeContractCount = await countActiveContractsByClientId(id);
	assertCanBeDeleted(activeContractCount);

	await prisma.client.update({
		where: { id },
		data: { deletedAt: new Date() },
	});

	return { success: true };
}

export async function restore({
	firmId,
	id,
}: EntityUniqueParams): Promise<MutationReturnType> {
	await requireById({ firmId, id });

	await prisma.client.update({
		where: { id },
		data: { deletedAt: null },
	});

	return { success: true };
}
