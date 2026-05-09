import type { Option } from "@/shared/schemas/option";
import type { ContractDetail } from "../schemas/model";

export interface ContractEditOptions {
	currentClient: Option;
	currentEmployees: Option[];
}

export function mergeLegacyContractOption(
	options: Option[],
	legacyOption?: Option,
) {
	if (!legacyOption) {
		return options;
	}

	if (options.some((option) => option.value === legacyOption.value)) {
		return options;
	}

	return [...options, legacyOption];
}

export function getContractEditOptionDefaults(
	contract: ContractDetail,
): ContractEditOptions {
	return {
		currentClient: {
			id: contract.clientId,
			value: String(contract.clientId),
			label: contract.client,
			isDisabled: true,
		},
		currentEmployees: contract.assignments.map((assignment) => ({
			id: assignment.employeeId,
			value: String(assignment.employeeId),
			label: assignment.employeeName,
			isDisabled: true,
		})),
	};
}
