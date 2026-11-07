import { createAuditLog } from "@/features/audit-logs";
import { Prisma } from "@/generated/prisma/client";
import type { LoggedUserSession } from "@/shared/session";
import { SETTLEMENT_ERRORS } from "../constants/errors";
import { getRemunerationDueDate } from "../utils/date";

export async function generateReceiptRemunerations(
	tx: Prisma.TransactionClient,
	session: LoggedUserSession,
	receipt: {
		id: number;
		receivableId: number;
		effectiveAmount: Prisma.Decimal;
		effectiveDate: Date;
		actualPaymentMethodId: number;
	},
) {
	if (receipt.effectiveAmount.isZero()) {
		return;
	}
	const firmId = session.firm.id;
	const bridge = await tx.contractRevenueReceivable.findFirst({
		where: { firmId, receivableId: receipt.receivableId },
		select: {
			contract: {
				select: {
					assignments: {
						where: { firmId, isActive: true, deletedAt: null },
						orderBy: { id: "asc" },
						select: {
							id: true,
							assignmentType: { select: { value: true } },
							employeeProfile: {
								select: {
									isActive: true,
									deletedAt: true,
									remunerationPercentage: true,
									referralPercentage: true,
									employeeType: { select: { value: true } },
									person: {
										select: {
											isActive: true,
											deletedAt: true,
											supplierProfile: { select: { id: true, isActive: true } },
										},
									},
								},
							},
						},
					},
				},
			},
		},
	});
	if (!bridge) {
		throw new Error(SETTLEMENT_ERRORS.REMUNERATION);
	}
	const firm = await tx.firm.findUniqueOrThrow({
		where: { id: firmId },
		select: { remunerationCutoffDay: true, remunerationDueDay: true },
	});
	const dueDate = getRemunerationDueDate(
		receipt.effectiveDate.toISOString().slice(0, 10),
		firm.remunerationCutoffDay,
		firm.remunerationDueDay,
	);
	const assignments = bridge.contract.assignments;
	const referral = assignments
		.filter((assignment) => assignment.assignmentType.value === "RECOMMENDING")
		.reduce(
			(highest, assignment) =>
				Prisma.Decimal.max(
					highest,
					assignment.employeeProfile.referralPercentage,
				),
			new Prisma.Decimal(0),
		);
	for (const assignment of assignments) {
		const employee = assignment.employeeProfile;
		const kind = assignment.assignmentType.value;
		const percentage =
			kind === "RECOMMENDING"
				? employee.referralPercentage
				: kind === "RECOMMENDED"
					? employee.remunerationPercentage.minus(referral)
					: kind === "RESPONSIBLE" || kind === "ADMIN_ASSISTANT"
						? employee.remunerationPercentage
						: new Prisma.Decimal(0);
		if (percentage.lt(0) || percentage.gt(1)) {
			throw new Error(SETTLEMENT_ERRORS.REMUNERATION);
		}
		const amount = receipt.effectiveAmount
			.mul(percentage)
			.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
		if (amount.isZero()) {
			continue;
		}
		const supplier = employee.person.supplierProfile;
		if (
			!employee.isActive ||
			employee.deletedAt ||
			!employee.person.isActive ||
			employee.person.deletedAt ||
			!supplier?.isActive
		) {
			throw new Error(SETTLEMENT_ERRORS.REMUNERATION);
		}
		const analytic = await tx.financialAnalytic.findFirst({
			where: {
				value:
					employee.employeeType.value === "LAWYER"
						? "PAYROLL_LAWYERS"
						: employee.employeeType.value === "INTERN"
							? "PAYROLL_INTERNS"
							: "PAYROLL_STAFF",
				isActive: true,
			},
			select: { id: true },
		});
		if (!analytic) {
			throw new Error(SETTLEMENT_ERRORS.REMUNERATION);
		}
		const payable = await tx.payable.create({
			data: {
				firmId,
				beneficiaryId: supplier.id,
				amount,
				dueDate,
				analyticId: analytic.id,
				expectedPaymentMethodId: receipt.actualPaymentMethodId,
				kind: "EXTRA",
			},
		});
		const remuneration = await tx.remunerationPayable.create({
			data: {
				firmId,
				receiptId: receipt.id,
				contractAssignmentId: assignment.id,
				payableId: payable.id,
				calculationBase: receipt.effectiveAmount,
				effectivePercentage: percentage,
				calculatedAmount: amount,
				computedDueDate: dueDate,
				ruleSnapshot: {
					assignmentType: kind,
					employeeType: employee.employeeType.value,
					remunerationPercentage: employee.remunerationPercentage.toString(),
					referralPercentage: employee.referralPercentage.toString(),
					recommendingReferralPercentage: referral.toString(),
					cutoffDay: firm.remunerationCutoffDay,
					dueDay: firm.remunerationDueDay,
				},
			},
		});
		await createAuditLog(tx, {
			firmId,
			actor: {
				id: session.person?.id,
				name: session.user.fullName,
				email: session.user.email,
			},
			action: "CREATE",
			entityType: "Payable",
			entityId: payable.id,
			entityName: `Título a pagar #${payable.id}`,
			description: `Gerou remuneração pelo recebimento ${receipt.id}.`,
			changeData: { after: { payable, remuneration } },
		});
	}
}
