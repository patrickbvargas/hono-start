import { formatter } from "@/shared/lib/formatter";
import type { Option } from "@/shared/schemas/option";
import type {
	ContractAssignmentInput,
	ContractRevenueInput,
} from "../schemas/form";

export function getAssignmentSummary(
	assignment: ContractAssignmentInput,
	index: number,
	employees: Option[],
	assignmentTypes: Option[],
) {
	const employeeLabel = assignment.employeeId.trim()
		? (employees.find((option) => option.value === assignment.employeeId)
				?.label ?? `Colaborador #${assignment.employeeId}`)
		: `Colaborador ${index + 1}`;
	const assignmentTypeLabel = assignment.assignmentType.trim()
		? (assignmentTypes.find(
				(option) => option.value === assignment.assignmentType,
			)?.label ?? assignment.assignmentType)
		: "Atribuição pendente";

	return `${employeeLabel} • ${assignmentTypeLabel}`;
}

export function getRevenueSummary(
	revenue: ContractRevenueInput,
	index: number,
	revenueTypes: Option[],
) {
	const typeLabel = revenue.type.trim()
		? (revenueTypes.find((option) => option.value === revenue.type)?.label ??
			revenue.type)
		: `Receita ${index + 1}`;
	const totalValue =
		revenue.totalValue > 0
			? formatter.currency(revenue.totalValue)
			: "Valor pendente";

	const installments =
		revenue.totalValue > 0 && revenue.totalInstallments > 0
			? ` • ${revenue.totalInstallments} ${revenue.totalInstallments === 1 ? "parcela" : "parcelas"}`
			: "";
	return `${typeLabel} • ${totalValue}${installments}`;
}
