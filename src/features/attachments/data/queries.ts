import { getPersonById } from "@/features/people/data/queries";
import type { Prisma } from "@/generated/prisma/client";
import { env } from "@/shared/config/env";
import { prisma } from "@/shared/lib/prisma";
import type {
	ContractAccessResource,
	LoggedUserSession,
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
	const feeModel = (prisma as unknown as Record<string, unknown>).fee as
		| {
				findFirst: (args: unknown) => Promise<{
					id: number;
					firmId: number;
					deletedAt: Date | null;
					revenue: {
						firmId: number;
						deletedAt: Date | null;
						contractId: number;
					};
				} | null>;
		  }
		| undefined;
	if (!feeModel) {
		return null;
	}
	const fee = await feeModel.findFirst({
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
	const remunerationModel = (prisma as unknown as Record<string, unknown>)
		.remuneration as
		| {
				findFirst: (args: unknown) => Promise<{
					id: number;
					firmId: number;
					deletedAt: Date | null;
					feeId: number;
					contractEmployee: {
						firmId: number;
						deletedAt: Date | null;
						employeeId: number;
						employee: { deletedAt: Date | null };
						contract: { firmId: number; deletedAt: Date | null };
					};
				} | null>;
		  }
		| undefined;
	if (!remunerationModel) {
		return null;
	}
	const remuneration = await remunerationModel.findFirst({
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
					employee: { select: { deletedAt: true } },
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
		[assignment.firmId, assignment.contract.firmId].some((id) => id !== firmId)
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
	const clientModel = (prisma as unknown as Record<string, unknown>).client as
		| {
				findFirst: (args: unknown) => Promise<{
					id: number;
					deletedAt: Date | null;
				} | null>;
		  }
		| undefined;
	const client = clientModel
		? await clientModel.findFirst({
				where: { id },
				select: { id: true, deletedAt: true },
			})
		: await prisma.clientProfile.findFirst({
				where: { id },
				select: { id: true, deletedAt: true },
			});

	if (!client) {
		return null;
	}

	return {
		id: client.id,
		deletedAt: client.deletedAt,
		firmId,
		resource: { firmId },
	};
}

export async function getAttachmentEmployeeOwnerResource(
	firmId: number,
	id: number,
): Promise<AttachmentEmployeeOwnerResource | null> {
	const employeeModel = (prisma as unknown as Record<string, unknown>)
		.employee as
		| {
				findFirst: (args: unknown) => Promise<{
					id: number;
					deletedAt: Date | null;
				} | null>;
		  }
		| undefined;
	const employee = employeeModel
		? await employeeModel.findFirst({
				where: { id },
				select: { id: true, deletedAt: true },
			})
		: await prisma.employeeProfile.findFirst({
				where: { id },
				select: { id: true, deletedAt: true },
			});

	if (!employee) {
		return null;
	}

	return {
		id: employee.id,
		deletedAt: employee.deletedAt,
		firmId,
		resource: { employeeId: employee.id, firmId },
	};
}

export async function getAttachmentContractOwnerResource(
	firmId: number,
	id: number,
): Promise<AttachmentContractOwnerResource | null> {
	const isProfile = Boolean(prisma.clientProfile || prisma.employeeProfile);

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
					...(isProfile
						? {
								employeeProfileId: true,
								employeeProfile: {
									select: { employeeType: { select: { value: true } } },
								},
							}
						: {
								employeeId: true,
								employee: { select: { type: { select: { value: true } } } },
							}),
					assignmentType: { select: { value: true } },
				},
			},
		},
	});

	if (!contract) {
		return null;
	}

	const assignmentList = contract.assignments as unknown as Array<{
		employeeProfileId?: number;
		employeeId?: number;
		employeeProfile?: { employeeType: { value: string } };
		employee?: { type: { value: string } };
		assignmentType: { value: string };
	}>;

	return {
		id: contract.id,
		deletedAt: contract.deletedAt,
		firmId: contract.firmId,
		resource: {
			firmId: contract.firmId,
			statusValue: contract.status.value,
			allowStatusChange: contract.allowStatusChange,
			assignments: assignmentList.map((assignment) => ({
				employeeId: assignment.employeeProfileId ?? assignment.employeeId ?? 0,
				employeeTypeValue:
					assignment.employeeProfile?.employeeType.value ??
					assignment.employee?.type.value ??
					"",
				assignmentTypeValue: assignment.assignmentType.value,
			})),
			assignedEmployeeIds: assignmentList.map(
				(assignment) =>
					assignment.employeeProfileId ?? assignment.employeeId ?? 0,
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
	const isLegacy = Boolean(
		(prisma as unknown as Record<string, unknown>).client ||
			(prisma as unknown as Record<string, unknown>).employee,
	);
	const rows = await prisma.attachment.findMany({
		where: {
			...(owner.ownerKind === "person" ||
			owner.ownerKind === "client" ||
			owner.ownerKind === "employee"
				? {}
				: { firmId: params.firmId }),
			deletedAt: null,
			...(owner.ownerKind === "person" ? { personId: owner.ownerId } : {}),
			...(owner.ownerKind === "client"
				? isLegacy
					? ({ clientId: owner.ownerId } as unknown as { personId: number })
					: { personId: owner.ownerId }
				: {}),
			...(owner.ownerKind === "employee"
				? isLegacy
					? ({ employeeId: owner.ownerId } as unknown as { personId: number })
					: { personId: owner.ownerId }
				: {}),
			...(owner.ownerKind === "contract" ? { contractId: owner.ownerId } : {}),
			...(owner.ownerKind === "receivable"
				? { receivableId: owner.ownerId }
				: {}),
			...(owner.ownerKind === "expense" ? { expenseId: owner.ownerId } : {}),
			...(owner.ownerKind === "fee"
				? isLegacy
					? ({ feeId: owner.ownerId } as unknown as { receiptId: number })
					: { receiptId: owner.ownerId }
				: {}),
			...(owner.ownerKind === "remuneration"
				? isLegacy
					? ({ remunerationId: owner.ownerId } as unknown as {
							payableId: number;
						})
					: { payableId: owner.ownerId }
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

	const uploadEvents = rows.length
		? await prisma.auditLog.findMany({
				where: {
					entityType: "Attachment",
					action: "CREATE",
					entityId: { in: rows.map((row) => String(row.id)) },
				},
				select: { entityId: true, actorName: true },
				orderBy: [{ createdAt: "asc" }, { id: "asc" }],
			})
		: [];
	const senders = new Map<string, string | null>();
	for (const event of uploadEvents) {
		if (event.entityId && !senders.has(event.entityId)) {
			const name = event.actorName.trim();
			senders.set(event.entityId, name && name !== "Sistema" ? name : null);
		}
	}

	const attachments = await Promise.all(
		rows.map(async (attachment) => ({
			id: attachment.id,
			fileName: attachment.fileName,
			uploadedByName: senders.get(String(attachment.id)) ?? null,
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
	const isLegacy = Boolean(
		(prisma as unknown as Record<string, unknown>).client ||
			(prisma as unknown as Record<string, unknown>).employee,
	);
	const attachment = await prisma.attachment.findFirst({
		where: { id, ...getAttachmentVisibilityWhere(firmId) },
		select: {
			id: true,
			fileName: true,
			firmId: true,
			storagePath: true,
			mimeType: true,
			deletedAt: true,
			personId: true,
			contractId: true,
			expenseId: true,
			receivableId: true,
			receiptId: true,
			payableId: true,
			...(isLegacy
				? {
						clientId: true,
						employeeId: true,
						feeId: true,
						remunerationId: true,
					}
				: {}),
		} as unknown as Prisma.AttachmentSelect,
	});

	if (!attachment) {
		return null;
	}

	const raw = attachment as unknown as Record<string, unknown>;

	return {
		id: attachment.id,
		fileName: attachment.fileName,
		storagePath: attachment.storagePath,
		mimeType: attachment.mimeType,
		deletedAt: attachment.deletedAt,
		resource: {
			firmId:
				attachment.personId || raw.clientId || raw.employeeId
					? firmId
					: attachment.firmId,
		},
		ownerInput: {
			receivableId: attachment.receivableId ?? undefined,
			personId: attachment.personId ?? undefined,
			clientId: (raw.clientId as number) ?? undefined,
			employeeId: (raw.employeeId as number) ?? undefined,
			contractId: attachment.contractId ?? undefined,
			expenseId: attachment.expenseId ?? undefined,
			feeId: attachment.receiptId ?? (raw.feeId as number) ?? undefined,
			remunerationId:
				attachment.payableId ?? (raw.remunerationId as number) ?? undefined,
		},
	};
}

export async function assertAttachmentOwnerExists(params: {
	firmId: number;
	input: AttachmentOwnerInput;
	session?: LoggedUserSession;
}) {
	const owner = getAttachmentOwnerContext(params.input);

	switch (owner.ownerKind) {
		case "receivable": {
			const title = await prisma.receivable.findFirst({
				where: { id: owner.ownerId, firmId: params.firmId },
				select: {
					id: true,
					firmId: true,
					contractRevenueReceivable: { select: { contractId: true } },
				},
			});
			if (!title) {
				throw new Error(ATTACHMENT_ERRORS.OWNER_NOT_FOUND);
			}
			const contract = title.contractRevenueReceivable
				? await getAttachmentContractOwnerResource(
						params.firmId,
						title.contractRevenueReceivable.contractId,
					)
				: null;
			return {
				owner,
				access: {
					id: title.id,
					firmId: title.firmId,
					deletedAt: null,
					resource: { firmId: title.firmId, contract: contract?.resource },
				},
			};
		}
		case "person": {
			if (!params.session) {
				throw new Error(ATTACHMENT_ERRORS.OWNER_NOT_FOUND);
			}
			const person = await getPersonById({
				session: params.session,
				id: owner.ownerId,
			});
			return {
				owner,
				access: {
					id: person.id,
					deletedAt: person.isSoftDeleted
						? new Date(person.updatedAt ?? person.createdAt)
						: null,
					firmId: params.firmId,
					resource: { firmId: params.firmId },
				},
			};
		}
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

export function getAttachmentVisibilityWhere(firmId: number) {
	const isLegacy = Boolean(
		(prisma as unknown as Record<string, unknown>).client ||
			(prisma as unknown as Record<string, unknown>).employee,
	);
	return {
		OR: [
			{ firmId },
			isLegacy
				? ({ clientId: { not: null } } as unknown as { personId: object })
				: { personId: { not: null } },
			isLegacy
				? ({ employeeId: { not: null } } as unknown as { personId: object })
				: { personId: { not: null } },
		],
	};
}
