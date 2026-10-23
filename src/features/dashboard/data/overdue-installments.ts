import { Prisma } from "@/generated/prisma/client";
import { formatter } from "@/shared/lib/formatter";
import type { DashboardOverdueInstallmentRow } from "../schemas/model";
import type { DashboardPeriod } from "../utils/period";
import { addMonthsPreservingDay, isDateInsidePeriod } from "../utils/period";
import type { RevenueRow } from "./revenue";

function getHandlingLawyerName(
	assignments: RevenueRow["contract"]["assignments"],
): string {
	const responsibleAssignment = assignments.find(
		(assignment) => assignment.assignmentType.value === "RESPONSIBLE",
	);

	if (responsibleAssignment) {
		return responsibleAssignment.employee.fullName;
	}

	const recommendedAssignment = assignments.find(
		(assignment) => assignment.assignmentType.value === "RECOMMENDED",
	);

	if (recommendedAssignment) {
		return recommendedAssignment.employee.fullName;
	}

	return "—";
}

function getCompletedMonthsElapsed(
	startDate: Date,
	referenceDate: Date,
): number {
	if (referenceDate < startDate) {
		return 0;
	}

	let monthDifference =
		(referenceDate.getUTCFullYear() - startDate.getUTCFullYear()) * 12 +
		(referenceDate.getUTCMonth() - startDate.getUTCMonth());

	if (referenceDate.getUTCDate() < startDate.getUTCDate()) {
		monthDifference -= 1;
	}

	return Math.max(monthDifference, 0);
}

function getInstallmentAmount(revenue: RevenueRow): Prisma.Decimal {
	return new Prisma.Decimal(revenue.totalValue.toString())
		.minus(new Prisma.Decimal(revenue.downPaymentValue?.toString() ?? 0))
		.div(revenue.totalInstallments);
}

export function buildOverdueInstallmentRows({
	period,
	revenues,
}: {
	period: DashboardPeriod;
	revenues: RevenueRow[];
}): DashboardOverdueInstallmentRow[] {
	const referenceDate = period.dateTo ?? new Date();

	return revenues
		.flatMap((revenue) => {
			const expectedInstallments = Math.min(
				revenue.totalInstallments,
				getCompletedMonthsElapsed(revenue.paymentStartDate, referenceDate),
			);

			if (expectedInstallments <= 0) {
				return [];
			}

			const activeInstallments = new Set(
				revenue.fees.map((fee) => fee.installmentNumber),
			);
			const installmentAmount = getInstallmentAmount(revenue);
			const lawyerName = getHandlingLawyerName(revenue.contract.assignments);
			const rows: DashboardOverdueInstallmentRow[] = [];

			for (
				let installmentNumber = 1;
				installmentNumber <= expectedInstallments;
				installmentNumber += 1
			) {
				if (activeInstallments.has(installmentNumber)) {
					continue;
				}

				const dueDate = addMonthsPreservingDay(
					revenue.paymentStartDate,
					installmentNumber,
				);

				if (!isDateInsidePeriod(dueDate, period)) {
					continue;
				}

				rows.push({
					contractProcessNumber: revenue.contract.processNumber,
					clientName: revenue.contract.client.fullName,
					lawyerName,
					legalArea: revenue.contract.legalArea.label,
					revenueType: revenue.type.label,
					installmentNumber,
					dueDate: dueDate.toISOString(),
					installmentAmount: Number(installmentAmount),
					formattedInstallmentAmount: formatter.currency(
						Number(installmentAmount),
					),
					totalValue: Number(revenue.totalValue),
					formattedTotalValue: formatter.currency(Number(revenue.totalValue)),
				});
			}

			return rows;
		})
		.sort((first, second) => {
			const dueDateComparison = first.dueDate.localeCompare(second.dueDate);

			if (dueDateComparison !== 0) {
				return dueDateComparison;
			}

			const contractComparison = first.contractProcessNumber.localeCompare(
				second.contractProcessNumber,
				"pt-BR",
			);

			if (contractComparison !== 0) {
				return contractComparison;
			}

			return first.installmentNumber - second.installmentNumber;
		});
}
