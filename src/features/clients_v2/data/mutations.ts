import { prisma } from "@/shared/lib/prisma";
import type { EntityId } from "@/shared/schemas/entity";
import type { MutationReturnType } from "@/shared/types/api";
import { CLIENT_ERRORS } from "../constants/errors";
import { assertClientCanBeDeleted } from "../rules/delete";
import {
	assertClientTypeCanBeSelected,
	assertClientTypeExists,
	assertClientTypeImmutableOnUpdate,
} from "../rules/type";
import type { ClientCreateInput, ClientUpdateInput } from "../schemas/form";
import {
	countActiveContractsByClientId,
	findClientById,
	findClientTypeByValue,
} from "./queries";

export async function createClientRecord({
	firmId,
	input,
}: {
	firmId: EntityId;
	input: ClientCreateInput;
}): Promise<MutationReturnType> {
	const type = await findClientTypeByValue(input.type);

	assertClientTypeExists(type);
	assertClientTypeCanBeSelected(type);

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

export async function updateClientRecord({
	firmId,
	input,
}: {
	firmId: EntityId;
	input: ClientUpdateInput;
}): Promise<MutationReturnType> {
	// TODO: refatorar
	const existing = await findClientById({ firmId, id: input.id });
	if (!existing) throw new Error(CLIENT_ERRORS.CLIENT_NOT_FOUND);

	const type = await findClientTypeByValue(input.type);

	assertClientTypeExists(type);
	assertClientTypeCanBeSelected(type, existing.typeId);
	assertClientTypeImmutableOnUpdate(type, existing.typeId);

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

export async function deleteClientRecord({
	firmId,
	id,
}: {
	firmId: EntityId;
	id: EntityId;
}): Promise<MutationReturnType> {
	// TODO: refatorar
	const existing = await findClientById({ firmId, id: id });
	if (!existing) throw new Error(CLIENT_ERRORS.CLIENT_NOT_FOUND);

	const activeContractCount = await countActiveContractsByClientId(id);
	assertClientCanBeDeleted(activeContractCount);

	await prisma.client.update({
		where: { id },
		data: { deletedAt: new Date() },
	});

	return { success: true };
}

export async function restoreClientRecord({
	firmId,
	id,
}: {
	firmId: EntityId;
	id: EntityId;
}): Promise<MutationReturnType> {
	// TODO: refatorar
	const existing = await findClientById({ firmId, id });
	if (!existing) throw new Error(CLIENT_ERRORS.CLIENT_NOT_FOUND);

	await prisma.client.update({
		where: { id },
		data: { deletedAt: null },
	});

	return { success: true };
}
