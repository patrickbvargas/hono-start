import { createAttachmentSignedUrl } from "@/shared/lib/attachment-storage";
import { prisma } from "@/shared/lib/prisma";
import { type Option, optionSchema } from "@/shared/schemas/option";
import type { ContractAccessResource } from "@/shared/session";
import type {
	QueryManyReturnType,
	QueryOneReturnType,
} from "@/shared/types/api";
import { ATTACHMENT_ERRORS } from "../constants/errors";
import {
	type AttachmentOwnerInput,
	getAttachmentOwnerContext,
} from "../schemas/form";
import {
	type AttachmentSummary,
	attachmentSummarySchema,
} from "../schemas/model";

interface AttachmentOwnerResource {
	deletedAt: Date | null;
	firmId: number;
	id: number;
	resource: { firmId: number };
}

interface AttachmentEmployeeOwnerResource extends AttachmentOwnerResource {
	resource: { employeeId: number; firmId: number };
}

interface AttachmentContractOwnerResource extends AttachmentOwnerResource {
	resource: ContractAccessResource;
}

export async function getAttachmentTypes(): Promise<
	QueryManyReturnType<Option>
> {
	const rows = await prisma.attachmentType.findMany({
		orderBy: { label: "asc" },
	});

	return optionSchema.array().parse(rows);
}

export async function getAttachmentTypeByValue(value: string) {
	return prisma.attachmentType.findUnique({
		where: { value },
	});
}

export async function getAttachmentClientOwnerResource(
	firmId: number,
	id: number,
): Promise<AttachmentOwnerResource | null> {
	const client = await prisma.client.findFirst({
		where: { id, firmId },
		select: { id: true, firmId: true, deletedAt: true },
	});

	if (!client) {
		return null;
	}

	return {
		id: client.id,
		deletedAt: client.deletedAt,
		firmId: client.firmId,
		resource: { firmId: client.firmId },
	};
}

export async function getAttachmentEmployeeOwnerResource(
	firmId: number,
	id: number,
): Promise<AttachmentEmployeeOwnerResource | null> {
	const employee = await prisma.employee.findFirst({
		where: { id, firmId },
		select: { id: true, firmId: true, deletedAt: true },
	});

	if (!employee) {
		return null;
	}

	return {
		id: employee.id,
		deletedAt: employee.deletedAt,
		firmId: employee.firmId,
		resource: { employeeId: employee.id, firmId: employee.firmId },
	};
}

export async function getAttachmentContractOwnerResource(
	firmId: number,
	id: number,
): Promise<AttachmentContractOwnerResource | null> {
	const contract = await prisma.contract.findFirst({
		where: { id, firmId },
		select: {
			id: true,
			firmId: true,
			deletedAt: true,
			allowStatusChange: true,
			status: {
				select: {
					value: true,
				},
			},
			assignments: {
				where: { deletedAt: null, isActive: true },
				select: { employeeId: true },
			},
		},
	});

	if (!contract) {
		return null;
	}

	return {
		id: contract.id,
		deletedAt: contract.deletedAt,
		firmId: contract.firmId,
		resource: {
			firmId: contract.firmId,
			statusValue: contract.status.value,
			allowStatusChange: contract.allowStatusChange,
			assignedEmployeeIds: contract.assignments.map(
				(assignment) => assignment.employeeId,
			),
		},
	};
}

export async function getAttachmentsByOwner(params: {
	firmId: number;
	input: AttachmentOwnerInput;
}): Promise<QueryManyReturnType<AttachmentSummary>> {
	const owner = getAttachmentOwnerContext(params.input);
	const rows = await prisma.attachment.findMany({
		where: {
			firmId: params.firmId,
			deletedAt: null,
			...(owner.ownerKind === "client" ? { clientId: owner.ownerId } : {}),
			...(owner.ownerKind === "employee" ? { employeeId: owner.ownerId } : {}),
			...(owner.ownerKind === "contract" ? { contractId: owner.ownerId } : {}),
		},
		include: {
			type: {
				select: {
					id: true,
					label: true,
					value: true,
				},
			},
		},
		orderBy: [{ createdAt: "desc" }, { id: "desc" }],
	});

	const attachments = await Promise.all(
		rows.map(async (attachment) => ({
			id: attachment.id,
			fileName: attachment.fileName,
			fileSize: attachment.fileSize,
			mimeType: attachment.mimeType,
			typeId: attachment.type.id,
			type: attachment.type.label,
			typeValue: attachment.type.value,
			downloadUrl: await createAttachmentSignedUrl({
				path: attachment.storagePath,
			}),
			isActive: attachment.isActive,
			isSoftDeleted: Boolean(attachment.deletedAt),
			createdAt: attachment.createdAt.toISOString(),
			updatedAt: attachment.updatedAt?.toISOString() ?? null,
		})),
	);

	return attachmentSummarySchema.array().parse(attachments);
}

export async function getAttachmentAccessById(
	firmId: number,
	id: number,
): Promise<QueryOneReturnType<{
	deletedAt: Date | null;
	fileName: string;
	id: number;
	resource: { firmId: number };
	storagePath: string;
}> | null> {
	const attachment = await prisma.attachment.findFirst({
		where: { id, firmId },
		select: {
			id: true,
			fileName: true,
			firmId: true,
			storagePath: true,
			deletedAt: true,
		},
	});

	if (!attachment) {
		return null;
	}

	return {
		id: attachment.id,
		fileName: attachment.fileName,
		storagePath: attachment.storagePath,
		deletedAt: attachment.deletedAt,
		resource: { firmId: attachment.firmId },
	};
}

export async function assertAttachmentOwnerExists(params: {
	firmId: number;
	input: AttachmentOwnerInput;
}) {
	const owner = getAttachmentOwnerContext(params.input);

	switch (owner.ownerKind) {
		case "client": {
			const client = await getAttachmentClientOwnerResource(
				params.firmId,
				owner.ownerId,
			);

			if (!client) {
				throw new Error(ATTACHMENT_ERRORS.OWNER_NOT_FOUND);
			}

			return { owner, access: client };
		}
		case "employee": {
			const employee = await getAttachmentEmployeeOwnerResource(
				params.firmId,
				owner.ownerId,
			);

			if (!employee) {
				throw new Error(ATTACHMENT_ERRORS.OWNER_NOT_FOUND);
			}

			return { owner, access: employee };
		}
		case "contract": {
			const contract = await getAttachmentContractOwnerResource(
				params.firmId,
				owner.ownerId,
			);

			if (!contract) {
				throw new Error(ATTACHMENT_ERRORS.OWNER_NOT_FOUND);
			}

			return { owner, access: contract };
		}
	}
}
