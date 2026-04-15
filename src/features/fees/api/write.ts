import { Prisma } from "@/generated/prisma/client";
import {
	CONTRACT_STATUS_ACTIVE_VALUE,
	CONTRACT_STATUS_CANCELLED_VALUE,
	CONTRACT_STATUS_COMPLETED_VALUE,
} from "@/shared/session";
import { FEE_ERRORS } from "../constants/errors";

const ASSIGNMENT_TYPE_RESPONSIBLE_VALUE = "RESPONSIBLE";
const ASSIGNMENT_TYPE_RECOMMENDING_VALUE = "RECOMMENDING";
const ASSIGNMENT_TYPE_RECOMMENDED_VALUE = "RECOMMENDED";
const ASSIGNMENT_TYPE_ADMIN_ASSISTANT_VALUE = "ADMIN_ASSISTANT";

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

export async function syncFeeRemunerations({
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

export async function syncFeeDeleteState(
	tx: Prisma.TransactionClient,
	feeId: number,
	deletedAt: Date | null,
) {
	await tx.remuneration.updateMany({
		where: { feeId },
		data: { deletedAt },
	});
}

export async function syncContractStatusFromFees(
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
