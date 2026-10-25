import { env } from "@/shared/config/env";
import { prisma } from "@/shared/lib/prisma";
import type {
	ContractAccessResource,
	RemunerationAccessResource,
} from "@/shared/session";
import type {
	QueryManyReturnType,
	QueryOneReturnType,
} from "@/shared/types/api";
import { ATTACHMENT_ERRORS } from "../constants/errors";
import type { AttachmentOwnerInput } from "../schemas/form";
import {
	type AttachmentSummary,
	attachmentSummarySchema,
} from "../schemas/model";
import { getAttachmentOwnerContext } from "../utils/owner";

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

interface AttachmentExpenseOwnerResource extends AttachmentOwnerResource {
	resource: { firmId: number };
}

interface AttachmentRemunerationOwnerResource extends AttachmentOwnerResource {
	resource: RemunerationAccessResource;
}

export async function getAttachmentFeeOwnerResource(
	firmId: number,
	id: number,
): Promise<AttachmentContractOwnerResource | null> {
	const fee = await prisma.fee.findFirst({
		where: { id, firmId },
		select: {
			id: true,
			firmId: true,
			deletedAt: true,
			revenue: { select: { firmId: true, deletedAt: true, contractId: true } },
		},
	});
	if (!fee || fee.revenue.firmId !== firmId) {
		return null;
	}
	const contract = await getAttachmentContractOwnerResource(
		firmId,
		fee.revenue.contractId,
	);
	if (!contract) {
		return null;
	}
	return {
		id: fee.id,
		firmId,
		deletedAt: fee.deletedAt ?? fee.revenue.deletedAt ?? contract.deletedAt,
		resource: contract.resource,
	};
}

export async function getAttachmentRemunerationOwnerResource(
	firmId: number,
	id: number,
): Promise<AttachmentRemunerationOwnerResource | null> {
	const remuneration = await prisma.remuneration.findFirst({
		where: { id, firmId },
		select: {
			id: true,
			firmId: true,
			deletedAt: true,
			feeId: true,
			contractEmployee: {
				select: {
					firmId: true,
					deletedAt: true,
					employeeId: true,
					employee: { select: { firmId: true, deletedAt: true } },
					contract: { select: { firmId: true, deletedAt: true } },
				},
			},
		},
	});
	if (!remuneration) {
		return null;
	}
	const assignment = remuneration.contractEmployee;
	if (
		[
			assignment.firmId,
			assignment.employee.firmId,
			assignment.contract.firmId,
		].some((id) => id !== firmId)
	) {
		return null;
	}
	const fee = await getAttachmentFeeOwnerResource(firmId, remuneration.feeId);
	if (!fee) {
		return null;
	}
	return {
		id: remuneration.id,
		firmId,
		deletedAt:
			remuneration.deletedAt ??
			fee.deletedAt ??
			assignment.deletedAt ??
			assignment.employee.deletedAt ??
			assignment.contract.deletedAt,
		resource: { firmId, employeeId: assignment.employeeId },
	};
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
				select: {
					employeeId: true,
					employee: { select: { type: { select: { value: true } } } },
					assignmentType: { select: { value: true } },
				},
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
			assignments: contract.assignments.map((assignment) => ({
				employeeId: assignment.employeeId,
				employeeTypeValue: assignment.employee.type.value,
				assignmentTypeValue: assignment.assignmentType.value,
			})),
			assignedEmployeeIds: contract.assignments.map(
				(assignment) => assignment.employeeId,
			),
		},
	};
}

export async function getAttachmentExpenseOwnerResource(
	firmId: number,
	id: number,
): Promise<AttachmentExpenseOwnerResource | null> {
	const expense = await prisma.expense.findFirst({
		where: { id, firmId },
		select: { id: true, firmId: true, deletedAt: true },
	});

	if (!expense) {
		return null;
	}

	return {
		id: expense.id,
		deletedAt: expense.deletedAt,
		firmId: expense.firmId,
		resource: { firmId: expense.firmId },
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
			...(owner.ownerKind === "expense" ? { expenseId: owner.ownerId } : {}),
			...(owner.ownerKind === "fee" ? { feeId: owner.ownerId } : {}),
			...(owner.ownerKind === "remuneration"
				? { remunerationId: owner.ownerId }
				: {}),
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
			downloadUrl: new URL(`/api/attachments/${attachment.id}`, env.APP_URL)
				.href,
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
	mimeType: string;
	ownerInput: AttachmentOwnerInput;
}> | null> {
	const attachment = await prisma.attachment.findFirst({
		where: { id, firmId },
		select: {
			id: true,
			fileName: true,
			firmId: true,
			storagePath: true,
			mimeType: true,
			deletedAt: true,
			clientId: true,
			employeeId: true,
			contractId: true,
			expenseId: true,
			feeId: true,
			remunerationId: true,
		},
	});

	if (!attachment) {
		return null;
	}

	return {
		id: attachment.id,
		fileName: attachment.fileName,
		storagePath: attachment.storagePath,
		mimeType: attachment.mimeType,
		deletedAt: attachment.deletedAt,
		resource: { firmId: attachment.firmId },
		ownerInput: {
			clientId: attachment.clientId ?? undefined,
			employeeId: attachment.employeeId ?? undefined,
			contractId: attachment.contractId ?? undefined,
			expenseId: attachment.expenseId ?? undefined,
			feeId: attachment.feeId ?? undefined,
			remunerationId: attachment.remunerationId ?? undefined,
		},
	};
}

export async function assertAttachmentOwnerExists(params: {
	firmId: number;
	input: AttachmentOwnerInput;
}) {
	const owner = getAttachmentOwnerContext(params.input);

	switch (owner.ownerKind) {
		case "fee": {
			const fee = await getAttachmentFeeOwnerResource(
				params.firmId,
				owner.ownerId,
			);
			if (!fee) {
				throw new Error(ATTACHMENT_ERRORS.OWNER_NOT_FOUND);
			}
			return { owner, access: fee };
		}
		case "remuneration": {
			const remuneration = await getAttachmentRemunerationOwnerResource(
				params.firmId,
				owner.ownerId,
			);
			if (!remuneration) {
				throw new Error(ATTACHMENT_ERRORS.OWNER_NOT_FOUND);
			}
			return { owner, access: remuneration };
		}
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
		case "expense": {
			const expense = await getAttachmentExpenseOwnerResource(
				params.firmId,
				owner.ownerId,
			);

			if (!expense) {
				throw new Error(ATTACHMENT_ERRORS.OWNER_NOT_FOUND);
			}

			return { owner, access: expense };
		}
	}
}
