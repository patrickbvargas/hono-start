import type { AuditLogActor } from "@/features/audit-logs/data/mutations";
import { createAuditLog } from "@/features/audit-logs/data/mutations";
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
} from "../rules/lookups";
import type { ClientCreateInput, ClientUpdateInput } from "../schemas/form";
import { getClientById, getClientTypeByValue } from "./queries";

export async function createClient({
	actor,
	firmId,
	input,
}: EntityInputParams<ClientCreateInput> & {
	actor?: AuditLogActor;
}): Promise<MutationReturnType> {
	const type = await getClientTypeByValue(input.type);

	assertTypeExists(type);
	assertTypeCanBeSelected(type);
	assertDocumentMatchesType({ type: type.value, document: input.document });

	await prisma.$transaction(async (tx) => {
		const client = await tx.client.create({
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

		await createAuditLog(tx, {
			firmId,
			actor,
			action: "CREATE",
			entityType: "Client",
			entityId: client.id,
			entityName: client.fullName,
			changeData: input,
			description: `Created client ${client.fullName}.`,
		});
	});

	return { success: true };
}

export async function updateClient({
	actor,
	firmId,
	input,
}: EntityInputParams<ClientUpdateInput> & {
	actor?: AuditLogActor;
}): Promise<MutationReturnType> {
	const client = await getClientById({ firmId, id: input.id });

	const type = await getClientTypeByValue(input.type);

	assertTypeExists(type);
	assertTypeCanBeSelected(type, client.typeId);
	assertTypeImmutableOnUpdate(type, client.typeId);
	assertDocumentMatchesType({ type: type.value, document: input.document });

	if (!actor) {
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

	await prisma.$transaction(async (tx) => {
		await tx.client.update({
			where: { id: input.id },
			data: {
				fullName: input.fullName,
				document: input.document,
				email: input.email,
				phone: input.phone,
				isActive: input.isActive,
			},
		});

		await createAuditLog(tx, {
			firmId,
			actor,
			action: "UPDATE",
			entityType: "Client",
			entityId: input.id,
			entityName: input.fullName,
			changeData: { before: client, after: input },
			description: `Updated client ${input.fullName}.`,
		});
	});

	return { success: true };
}

export async function deleteClient({
	actor,
	firmId,
	id,
}: EntityUniqueParams & {
	actor?: AuditLogActor;
}): Promise<MutationReturnType> {
	const client = await getClientById({ firmId, id });

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

	assertCanBeDeleted({
		activeContractCount: contractCount?._count.contracts ?? 0,
	});

	await prisma.$transaction(async (tx) => {
		await tx.client.update({
			where: { id },
			data: { deletedAt: new Date() },
		});

		await createAuditLog(tx, {
			firmId,
			actor,
			action: "DELETE",
			entityType: "Client",
			entityId: id,
			entityName: client.fullName,
			changeData: { before: client },
			description: `Deleted client ${client.fullName}.`,
		});
	});

	return { success: true };
}

export async function restoreClient({
	actor,
	firmId,
	id,
}: EntityUniqueParams & {
	actor?: AuditLogActor;
}): Promise<MutationReturnType> {
	const client = await getClientById({ firmId, id });

	await prisma.$transaction(async (tx) => {
		await tx.client.update({
			where: { id },
			data: { deletedAt: null },
		});

		await createAuditLog(tx, {
			firmId,
			actor,
			action: "RESTORE",
			entityType: "Client",
			entityId: id,
			entityName: client.fullName,
			changeData: { before: client },
			description: `Restored client ${client.fullName}.`,
		});
	});

	return { success: true };
}
