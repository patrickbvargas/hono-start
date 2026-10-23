import { formatter } from "@/shared/lib/formatter";
import type { DashboardOverdueInstallmentRow } from "../schemas/model";
import type { DashboardPeriod } from "../utils/period";
import type { RevenueRow } from "./revenue";
import { buildRevenueSchedule } from "./schedule";

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

export function buildOverdueInstallmentRows({
	period,
	revenues,
}: {
	period: DashboardPeriod;
	revenues: RevenueRow[];
}): DashboardOverdueInstallmentRow[] {
	const referenceDate = new Date(
		Math.min((period.dateTo ?? new Date()).getTime(), Date.now()),
	);

	return revenues
		.flatMap((revenue) => {
			const lawyerName = getHandlingLawyerName(revenue.contract.assignments);
			const rows: DashboardOverdueInstallmentRow[] = [];

			for (const item of buildRevenueSchedule(revenue, referenceDate)) {
				const referenceDay = new Date(referenceDate.toISOString().slice(0, 10));
				if (item.dueDate >= referenceDay || item.outstanding.lte(0)) {
					continue;
				}
				const { installmentNumber, dueDate } = item;
				const installmentAmount = item.outstanding;

				rows.push({
					contractId: revenue.contract.id,
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
