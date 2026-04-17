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
import { getClientById, getClientTypeByValue } from "./queries";

export async function createClient({
	firmId,
	input,
}: EntityInputParams<ClientCreateInput>): Promise<MutationReturnType> {
	const type = await getClientTypeByValue(input.type);

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

export async function updateClient({
	firmId,
	input,
}: EntityInputParams<ClientUpdateInput>): Promise<MutationReturnType> {
	const client = await getClientById({ firmId, id: input.id });

	const type = await getClientTypeByValue(input.type);

	assertTypeExists(type);
	assertTypeCanBeSelected(type, client.typeId);
	assertTypeImmutableOnUpdate(type, client.typeId);
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

export async function deleteClient({
	firmId,
	id,
}: EntityUniqueParams): Promise<MutationReturnType> {
	await getClientById({ firmId, id });

	const contractCount = await prisma.client.findFirst({
		where: { id },
		select: {
			_count: {
				select: {
					contracts: {
						where: {
							AND: [
								{
									deletedAt: null,
								},
								{
									isActive: true,
								},
							],
						},
					},
				},
			},
		},
	});

	assertCanBeDeleted(contractCount?._count.contracts ?? 0);

	await prisma.client.update({
		where: { id },
		data: { deletedAt: new Date() },
	});

	return { success: true };
}

export async function restoreClient({
	firmId,
	id,
}: EntityUniqueParams): Promise<MutationReturnType> {
	await getClientById({ firmId, id });

	await prisma.client.update({
		where: { id },
		data: { deletedAt: null },
	});

	return { success: true };
}
