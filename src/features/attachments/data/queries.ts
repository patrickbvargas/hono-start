import { getPersonAccessResource } from "@/features/people";
import type { Prisma } from "@/generated/prisma/client";
import { env } from "@/shared/config/env";
import { prisma } from "@/shared/lib/prisma";
import type {
	ContractAccessResource,
	FinancialAccessResource,
	LoggedUserSession,
} from "@/shared/session";
import { ATTACHMENT_ERRORS } from "../constants/errors";
import type { AttachmentOwnerInput } from "../schemas/form";
import { attachmentSummarySchema } from "../schemas/model";
import {
	getAttachmentOwnerContext,
	getAttachmentOwnerInput,
} from "../utils/owner";

interface OwnerAccess {
	id: number;
	firmId: number;
	deletedAt: Date | null;
	resource: FinancialAccessResource & ContractAccessResource;
}
export async function getAttachmentTypeByValue(value: string) {
	return prisma.attachmentType.findUnique({ where: { value } });
}
export async function getAttachmentContractOwnerResource(
	firmId: number,
	id: number,
): Promise<OwnerAccess | null> {
	const contract = await prisma.contract.findFirst({
		where: { id, firmId },
		select: {
			id: true,
			firmId: true,
			deletedAt: true,
			allowStatusChange: true,
			status: { select: { value: true } },
			assignments: {
				where: { deletedAt: null, isActive: true },
				select: {
					employeeProfileId: true,
					employeeProfile: {
						select: { employeeType: { select: { value: true } } },
					},
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
		firmId,
		deletedAt: contract.deletedAt,
		resource: {
			firmId,
			statusValue: contract.status.value,
			allowStatusChange: contract.allowStatusChange,
			assignments: contract.assignments.map((a) => ({
				employeeId: a.employeeProfileId,
				employeeTypeValue: a.employeeProfile.employeeType.value,
				assignmentTypeValue: a.assignmentType.value,
			})),
			assignedEmployeeIds: contract.assignments.map((a) => a.employeeProfileId),
		},
	};
}
export async function getAttachmentExpenseOwnerResource(
	firmId: number,
	id: number,
): Promise<OwnerAccess | null> {
	const expense = await prisma.expense.findFirst({
		where: { id, firmId },
		select: { id: true, firmId: true, deletedAt: true },
	});
	return expense ? { ...expense, resource: { firmId } } : null;
}
export async function getAttachmentsByOwner({
	firmId,
	input,
}: {
	firmId: number;
	input: AttachmentOwnerInput;
}) {
	const owner = getAttachmentOwnerContext(input);
	const rows = await prisma.attachment.findMany({
		where: {
			...(owner.ownerKind === "person" ? {} : { firmId }),
			...getAttachmentOwnerInput(owner),
			deletedAt: null,
		},
		include: { type: { select: { id: true, label: true, value: true } } },
		orderBy: [{ createdAt: "desc" }, { id: "asc" }],
	});
	const events = rows.length
		? await prisma.auditLog.findMany({
				where: {
					entityType: "Attachment",
					action: "CREATE",
					entityId: { in: rows.map((r) => String(r.id)) },
				},
				select: { entityId: true, actorName: true },
				orderBy: [{ createdAt: "asc" }, { id: "asc" }],
			})
		: [];
	const senders = new Map<string, string | null>();
	for (const event of events) {
		if (event.entityId && !senders.has(event.entityId)) {
			const name = event.actorName.trim();
			senders.set(event.entityId, name && name !== "Sistema" ? name : null);
		}
	}
	return attachmentSummarySchema.array().parse(
		rows.map((a) => ({
			id: a.id,
			fileName: a.fileName,
			uploadedByName: senders.get(String(a.id)) ?? null,
			fileSize: a.fileSize,
			mimeType: a.mimeType,
			typeId: a.type.id,
			type: a.type.label,
			typeValue: a.type.value,
			downloadUrl: new URL(`/api/attachments/${a.id}`, env.APP_URL).href,
			isActive: a.isActive,
			isSoftDeleted: Boolean(a.deletedAt),
			createdAt: a.createdAt.toISOString(),
			updatedAt: a.updatedAt?.toISOString() ?? null,
		})),
	);
}
export function getAttachmentVisibilityWhere(
	firmId: number,
): Prisma.AttachmentWhereInput {
	return { OR: [{ firmId }, { personId: { not: null } }] };
}
export async function getAttachmentAccessById(firmId: number, id: number) {
	const a = await prisma.attachment.findFirst({
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
			payableId: true,
			receiptId: true,
			paymentId: true,
			remunerationPayableId: true,
		},
	});
	if (!a) {
		return null;
	}
	return {
		...a,
		resource: { firmId: a.personId ? firmId : a.firmId },
		ownerInput: {
			personId: a.personId ?? undefined,
			contractId: a.contractId ?? undefined,
			expenseId: a.expenseId ?? undefined,
			receivableId: a.receivableId ?? undefined,
			payableId: a.payableId ?? undefined,
			receiptId: a.receiptId ?? undefined,
			paymentId: a.paymentId ?? undefined,
			remunerationPayableId: a.remunerationPayableId ?? undefined,
		},
	};
}
export async function assertAttachmentOwnerExists(params: {
	firmId: number;
	input: AttachmentOwnerInput;
	session?: LoggedUserSession;
}): Promise<{
	owner: ReturnType<typeof getAttachmentOwnerContext>;
	access: OwnerAccess;
}> {
	const owner = getAttachmentOwnerContext(params.input);
	const { firmId } = params;
	let access: OwnerAccess | null = null;
	switch (owner.ownerKind) {
		case "person": {
			if (!params.session) {
				throw new Error(ATTACHMENT_ERRORS.OWNER_NOT_FOUND);
			}
			const person = await getPersonAccessResource({
				session: params.session,
				id: owner.ownerId,
			});
			access = {
				id: person.id,
				firmId,
				deletedAt: person.deletedAt,
				resource: { firmId },
			};
			break;
		}
		case "contract":
			access = await getAttachmentContractOwnerResource(firmId, owner.ownerId);
			break;
		case "expense":
			access = await getAttachmentExpenseOwnerResource(firmId, owner.ownerId);
			break;
		case "receipt": {
			const receipt = await prisma.receipt.findFirst({
				where: { id: owner.ownerId, firmId },
				select: { receivableId: true },
			});
			if (receipt) {
				const source = (
					await assertAttachmentOwnerExists({
						...params,
						input: { receivableId: receipt.receivableId },
					})
				).access;
				access = { ...source, id: owner.ownerId };
			}
			break;
		}
		case "payment": {
			const payment = await prisma.payment.findFirst({
				where: { id: owner.ownerId, firmId },
				select: { payableId: true },
			});
			if (payment) {
				const source = (
					await assertAttachmentOwnerExists({
						...params,
						input: { payableId: payment.payableId },
					})
				).access;
				access = { ...source, id: owner.ownerId };
			}
			break;
		}
		case "remuneration-payable": {
			const remuneration = await prisma.remunerationPayable.findFirst({
				where: { id: owner.ownerId, firmId },
				select: { payableId: true },
			});
			if (remuneration) {
				const source = (
					await assertAttachmentOwnerExists({
						...params,
						input: { payableId: remuneration.payableId },
					})
				).access;
				access = { ...source, id: owner.ownerId };
			}
			break;
		}
		case "receivable": {
			const title = await prisma.receivable.findFirst({
				where: { id: owner.ownerId, firmId },
				select: {
					id: true,
					contractRevenueReceivable: { select: { contractId: true } },
				},
			});
			if (title) {
				const contract = title.contractRevenueReceivable
					? await getAttachmentContractOwnerResource(
							firmId,
							title.contractRevenueReceivable.contractId,
						)
					: null;
				access = {
					id: title.id,
					firmId,
					deletedAt: null,
					resource: { firmId, contract: contract?.resource },
				};
			}
			break;
		}
		case "payable": {
			const title = await prisma.payable.findFirst({
				where: { id: owner.ownerId, firmId },
				select: {
					id: true,
					beneficiary: { select: { personId: true } },
					remunerationPayable: {
						select: { contractAssignment: { select: { contractId: true } } },
					},
				},
			});
			if (title) {
				const contract = title.remunerationPayable
					? await getAttachmentContractOwnerResource(
							firmId,
							title.remunerationPayable.contractAssignment.contractId,
						)
					: null;
				access = {
					id: title.id,
					firmId,
					deletedAt: null,
					resource: {
						firmId,
						beneficiaryPersonId: title.beneficiary.personId,
						isRemuneration: !!title.remunerationPayable,
						contract: contract?.resource,
					},
				};
			}
			break;
		}
	}
	if (!access) {
		throw new Error(ATTACHMENT_ERRORS.OWNER_NOT_FOUND);
	}
	return { owner, access };
}
