import { CONTRACT_ERRORS } from "../constants/errors";
import type { ContractUpdateInput } from "../schemas/form";

export function assertContractSectionChanges({
	input,
	existing,
	canManageAssignments,
	canManageRevenues,
}: {
	input: ContractUpdateInput;
	existing: ContractUpdateInput;
	canManageAssignments: boolean;
	canManageRevenues: boolean;
}) {
	const assignments = (value: ContractUpdateInput) =>
		value.assignments
			.map((item) =>
				JSON.stringify([
					item.id,
					item.employeeId,
					item.assignmentType,
					item.isActive,
				]),
			)
			.sort();
	const revenues = (value: ContractUpdateInput) =>
		value.revenues
			.map((item) =>
				JSON.stringify([
					item.id,
					item.type,
					item.totalValue,
					item.downPaymentValue ?? 0,
					item.paymentStartDate,
					item.totalInstallments,
					item.isActive,
				]),
			)
			.sort();
	if (
		!canManageAssignments &&
		JSON.stringify(assignments(input)) !== JSON.stringify(assignments(existing))
	) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_TEAM_FORBIDDEN);
	}
	if (
		!canManageRevenues &&
		(input.feePercentage !== existing.feePercentage ||
			JSON.stringify(revenues(input)) !== JSON.stringify(revenues(existing)))
	) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_TERMS_FORBIDDEN);
	}
}
