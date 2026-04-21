import type { AuditLogActor } from "@/features/audit-logs/data/mutations";
import { createAuditLog } from "@/features/audit-logs/data/mutations";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";
import {
	CONTRACT_STATUS_ACTIVE_VALUE,
	CONTRACT_STATUS_CANCELLED_VALUE,
	CONTRACT_STATUS_COMPLETED_VALUE,
} from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { FEE_ERRORS } from "../constants/errors";
import {
	assertFeeParentConsistency,
	assertUniqueActiveInstallment,
} from "../rules/write";
import type { FeeCreateInput, FeeUpdateInput } from "../schemas/form";
import { normalizeFeeReference } from "../utils/normalization";
import type { getFeeAccessResourceById } from "./queries";

const ASSIGNMENT_TYPE_RESPONSIBLE_VALUE = "RESPONSIBLE";
const ASSIGNMENT_TYPE_RECOMMENDING_VALUE = "RECOMMENDING";
const ASSIGNMENT_TYPE_RECOMMENDED_VALUE = "RECOMMENDED";
const ASSIGNMENT_TYPE_ADMIN_ASSISTANT_VALUE = "ADMIN_ASSISTANT";

interface FeeWriteScope {
	firmId: number;
}

interface CreateFeeParams {
	actor?: AuditLogActor;
	scope: FeeWriteScope;
	input: FeeCreateInput;
}

interface UpdateFeeParams {
	actor?: AuditLogActor;
	scope: FeeWriteScope;
	input: FeeUpdateInput;
	access: NonNullable<Awaited<ReturnType<typeof getFeeAccessResourceById>>>;
}

interface FeeContractAssignment {
	id: number;
	employee: {
		remunerationPercentage: Prisma.Decimal;
		referralPercentage: Prisma.Decimal;
	};
	assignmentType: {
		value: string;
	};
}

interface SyncFeeRemunerationsParams {
	tx: Prisma.TransactionClient;
	feeId: number;
	firmId: number;
	amount: Prisma.Decimal;
	paymentDate: Date;
	assignments: FeeContractAssignment[];
}

function getRecommendingReferralPercentage(
	assignments: FeeContractAssignment[],
) {
	return assignments
		.filter(
			(assignment) =>
				assignment.assignmentType.value === ASSIGNMENT_TYPE_RECOMMENDING_VALUE,
		)
		.reduce(
			(highest, assignment) =>
				Prisma.Decimal.max(highest, assignment.employee.referralPercentage),
			new Prisma.Decimal(0),
		);
}

function getAssignmentEffectivePercentage(
	assignment: FeeContractAssignment,
	recommendingReferralPercentage: Prisma.Decimal,
) {
	switch (assignment.assignmentType.value) {
		case ASSIGNMENT_TYPE_RESPONSIBLE_VALUE:
		case ASSIGNMENT_TYPE_ADMIN_ASSISTANT_VALUE:
			return assignment.employee.remunerationPercentage;
		case ASSIGNMENT_TYPE_RECOMMENDING_VALUE:
			return assignment.employee.referralPercentage;
		case ASSIGNMENT_TYPE_RECOMMENDED_VALUE:
			return assignment.employee.remunerationPercentage.minus(
				recommendingReferralPercentage,
			);
		default:
			return new Prisma.Decimal(0);
	}
}

async function getWritableRevenue(firmId: number, revenueId: number) {
	return prisma.revenue.findFirst({
		where: {
			id: revenueId,
			deletedAt: null,
			firmId,
		},
		select: {
			id: true,
			firmId: true,
			contractId: true,
			totalInstallments: true,
			contract: {
				select: {
					assignments: {
						where: {
							deletedAt: null,
							isActive: true,
						},
						select: {
							id: true,
							employeeId: true,
							employee: {
								select: {
									referralPercentage: true,
									remunerationPercentage: true,
								},
							},
							assignmentType: {
								select: {
									value: true,
								},
							},
						},
					},
				},
			},
			fees: {
				where: {
					deletedAt: null,
					isActive: true,
				},
				select: {
					id: true,
					installmentNumber: true,
					isActive: true,
					deletedAt: true,
				},
			},
		},
	});
}

async function syncFeeRemunerations({
	tx,
	feeId,
	firmId,
	amount,
	paymentDate,
	assignments,
}: SyncFeeRemunerationsParams) {
	const activeRemunerations = await tx.remuneration.findMany({
		where: { feeId, deletedAt: null },
		select: {
			id: true,
			contractEmployeeId: true,
			isSystemGenerated: true,
		},
	});

	const manualOverrideAssignmentIds = new Set(
		activeRemunerations
			.filter((remuneration) => !remuneration.isSystemGenerated)
			.map((remuneration) => remuneration.contractEmployeeId),
	);

	await tx.remuneration.updateMany({
		where: {
			feeId,
			deletedAt: null,
			isSystemGenerated: true,
		},
		data: {
			deletedAt: new Date(),
		},
	});

	const recommendingReferralPercentage =
		getRecommendingReferralPercentage(assignments);

	const remunerations = assignments
		.filter((assignment) => !manualOverrideAssignmentIds.has(assignment.id))
		.map((assignment) => {
			const effectivePercentage = getAssignmentEffectivePercentage(
				assignment,
				recommendingReferralPercentage,
			);

			return {
				firmId,
				feeId,
				contractEmployeeId: assignment.id,
				effectivePercentage,
				amount: amount.mul(effectivePercentage),
				paymentDate,
				isSystemGenerated: true,
				isActive: true,
			};
		});

	if (remunerations.length > 0) {
		await tx.remuneration.createMany({
			data: remunerations,
		});
	}
}

async function syncFeeDeleteState(
	tx: Prisma.TransactionClient,
	feeId: number,
	deletedAt: Date | null,
) {
	await tx.remuneration.updateMany({
		where: { feeId },
		data: { deletedAt },
	});
}

async function syncContractStatusFromFees(
	tx: Prisma.TransactionClient,
	contractId: number,
) {
	const contract = await tx.contract.findUnique({
		where: { id: contractId },
		select: {
			id: true,
			allowStatusChange: true,
			status: {
				select: {
					value: true,
				},
			},
			revenues: {
				where: {
					deletedAt: null,
					isActive: true,
				},
				select: {
					totalValue: true,
					downPaymentValue: true,
					fees: {
						where: {
							deletedAt: null,
							isActive: true,
						},
						select: {
							amount: true,
						},
					},
				},
			},
		},
	});

	if (!contract || !contract.allowStatusChange) {
		return;
	}

	if (contract.status.value === CONTRACT_STATUS_CANCELLED_VALUE) {
		return;
	}

	const isFullyPaid =
		contract.revenues.length > 0 &&
		contract.revenues.every((revenue) => {
			const paidValue = revenue.fees.reduce(
				(total, fee) => total.add(fee.amount),
				new Prisma.Decimal(revenue.downPaymentValue ?? 0),
			);

			return paidValue.greaterThanOrEqualTo(revenue.totalValue);
		});

	const targetStatusValue = isFullyPaid
		? CONTRACT_STATUS_COMPLETED_VALUE
		: CONTRACT_STATUS_ACTIVE_VALUE;

	if (contract.status.value === targetStatusValue) {
		return;
	}

	const targetStatus = await tx.contractStatus.findUnique({
		where: { value: targetStatusValue },
		select: { id: true },
	});

	if (!targetStatus) {
		throw new Error(FEE_ERRORS.FEE_CONTRACT_STATUS_NOT_FOUND);
	}

	await tx.contract.update({
		where: { id: contractId },
		data: { statusId: targetStatus.id },
	});
}

export async function createFee({
	actor,
	scope,
	input,
}: CreateFeeParams): Promise<MutationReturnType> {
	const contractId = Number(normalizeFeeReference(input.contractId));
	const revenueId = Number(normalizeFeeReference(input.revenueId));
	const revenue = await getWritableRevenue(scope.firmId, revenueId);

	if (!revenue) {
		throw new Error(FEE_ERRORS.FEE_SELECT_REVENUE);
	}

	assertFeeParentConsistency({
		contractId,
		revenueContractId: revenue.contractId,
	});

	assertUniqueActiveInstallment({
		fees: revenue.fees,
		installmentNumber: input.installmentNumber,
	});

	if (revenue.fees.length >= revenue.totalInstallments) {
		throw new Error(FEE_ERRORS.FEE_CONTRACT_EXHAUSTED);
	}

	await prisma.$transaction(async (tx) => {
		const fee = await tx.fee.create({
			data: {
				firmId: revenue.firmId,
				revenueId: revenue.id,
				paymentDate: new Date(input.paymentDate.toString()),
				amount: input.amount,
				installmentNumber: input.installmentNumber,
				generatesRemuneration: input.generatesRemuneration,
				isActive: input.isActive,
			},
		});

		if (input.generatesRemuneration) {
			await syncFeeRemunerations({
				tx,
				feeId: fee.id,
				firmId: revenue.firmId,
				amount: new Prisma.Decimal(input.amount),
				paymentDate: new Date(input.paymentDate.toString()),
				assignments: revenue.contract.assignments,
			});
		}

		await syncContractStatusFromFees(tx, revenue.contractId);

		await createAuditLog(tx, {
			firmId: revenue.firmId,
			actor,
			action: "CREATE",
			entityType: "Fee",
			entityId: fee.id,
			entityName: `Installment ${fee.installmentNumber}`,
			changeData: input,
			description: `Created fee installment ${fee.installmentNumber}.`,
		});
	});

	return { success: true };
}

export async function updateFee({
	actor,
	scope,
	input,
	access,
}: UpdateFeeParams): Promise<MutationReturnType> {
	const contractId = Number(normalizeFeeReference(input.contractId));
	const revenueId = Number(normalizeFeeReference(input.revenueId));
	const nextRevenue = await getWritableRevenue(scope.firmId, revenueId);

	if (!nextRevenue) {
		throw new Error(FEE_ERRORS.FEE_SELECT_REVENUE);
	}

	assertFeeParentConsistency({
		contractId,
		revenueContractId: nextRevenue.contractId,
	});

	assertUniqueActiveInstallment({
		excludeFeeId: input.id,
		fees: nextRevenue.fees,
		installmentNumber: input.installmentNumber,
	});

	if (
		nextRevenue.fees.filter((fee) => fee.id !== input.id).length >=
		nextRevenue.totalInstallments
	) {
		throw new Error(FEE_ERRORS.FEE_CONTRACT_EXHAUSTED);
	}

	const isReparenting =
		access.contractId !== nextRevenue.contractId ||
		access.revenueId !== nextRevenue.id;

	if (isReparenting && access.manualRemunerationCount > 0) {
		throw new Error(FEE_ERRORS.FEE_REPARENT_MANUAL_OVERRIDE_BLOCKED);
	}

	if (
		isReparenting &&
		access.remunerationCount > 0 &&
		!input.generatesRemuneration
	) {
		throw new Error(FEE_ERRORS.FEE_REPARENT_PRESERVE_BLOCKED);
	}

	await prisma.$transaction(async (tx) => {
		await tx.fee.update({
			where: { id: input.id },
			data: {
				revenueId: nextRevenue.id,
				paymentDate: new Date(input.paymentDate.toString()),
				amount: input.amount,
				installmentNumber: input.installmentNumber,
				generatesRemuneration: input.generatesRemuneration,
				isActive: input.isActive,
				deletedAt: null,
			},
		});

		if (input.generatesRemuneration) {
			await syncFeeRemunerations({
				tx,
				feeId: input.id,
				firmId: nextRevenue.firmId,
				amount: new Prisma.Decimal(input.amount),
				paymentDate: new Date(input.paymentDate.toString()),
				assignments: nextRevenue.contract.assignments,
			});
		}

		await syncContractStatusFromFees(tx, access.contractId);

		if (access.contractId !== nextRevenue.contractId) {
			await syncContractStatusFromFees(tx, nextRevenue.contractId);
		}

		await createAuditLog(tx, {
			firmId: nextRevenue.firmId,
			actor,
			action: "UPDATE",
			entityType: "Fee",
			entityId: input.id,
			entityName: `Installment ${input.installmentNumber}`,
			changeData: input,
			description: `Updated fee installment ${input.installmentNumber}.`,
		});
	});

	return { success: true };
}

export async function deleteFee({
	actor,
	firmId,
	id,
	contractId,
}: {
	actor?: AuditLogActor;
	firmId: number;
	id: number;
	contractId: number;
}): Promise<MutationReturnType> {
	const deletedAt = new Date();

	await prisma.$transaction(async (tx) => {
		await tx.fee.update({
			where: { id },
			data: { deletedAt },
		});

		await syncFeeDeleteState(tx, id, deletedAt);
		await syncContractStatusFromFees(tx, contractId);

		await createAuditLog(tx, {
			firmId,
			actor,
			action: "DELETE",
			entityType: "Fee",
			entityId: id,
			entityName: `Fee ${id}`,
			changeData: { id, contractId },
			description: `Deleted fee ${id}.`,
		});
	});

	return { success: true };
}

export async function restoreFee({
	actor,
	firmId,
	id,
	contractId,
}: {
	actor?: AuditLogActor;
	firmId: number;
	id: number;
	contractId: number;
}): Promise<MutationReturnType> {
	await prisma.$transaction(async (tx) => {
		await tx.fee.update({
			where: { id },
			data: { deletedAt: null },
		});

		await syncFeeDeleteState(tx, id, null);
		await syncContractStatusFromFees(tx, contractId);

		await createAuditLog(tx, {
			firmId,
			actor,
			action: "RESTORE",
			entityType: "Fee",
			entityId: id,
			entityName: `Fee ${id}`,
			changeData: { id, contractId },
			description: `Restored fee ${id}.`,
		});
	});

	return { success: true };
}
