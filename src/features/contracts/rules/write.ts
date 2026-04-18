import { CONTRACT_MAX_REVENUES } from "../constants";
import { CONTRACT_ERRORS } from "../constants/errors";
import type {
	ContractAssignmentInput,
	ContractCreateInput,
	ContractRevenueInput,
	ContractUpdateInput,
} from "../schemas/form";

type ContractWriteInput = ContractCreateInput | ContractUpdateInput;

export function assertContractHasActiveAssignment(
	assignments: ContractAssignmentInput[],
) {
	if (!assignments.some((assignment) => assignment.isActive)) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_ASSIGNMENT_REQUIRED);
	}
}

export function assertContractHasActiveRevenue(
	revenues: ContractRevenueInput[],
) {
	if (!revenues.some((revenue) => revenue.isActive)) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_REVENUE_REQUIRED);
	}
}

export function assertContractRevenueLimit(revenues: ContractRevenueInput[]) {
	if (
		revenues.filter((revenue) => revenue.isActive).length >
		CONTRACT_MAX_REVENUES
	) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_REVENUE_LIMIT);
	}
}

export function assertContractUniqueActiveRevenueTypes(
	revenues: ContractRevenueInput[],
) {
	const activeTypes = revenues
		.filter((revenue) => revenue.isActive)
		.map((revenue) => revenue.type);

	if (new Set(activeTypes).size !== activeTypes.length) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_REVENUE_TYPE_DUPLICATE);
	}
}

export function assertContractUniqueActiveAssignments(
	assignments: ContractAssignmentInput[],
) {
	const activeEmployeeIds = assignments
		.filter((assignment) => assignment.isActive)
		.map((assignment) => assignment.employeeId);

	if (new Set(activeEmployeeIds).size !== activeEmployeeIds.length) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_ASSIGNMENT_DUPLICATE);
	}
}

export function assertContractRevenueDownPayment(
	revenues: ContractRevenueInput[],
) {
	for (const revenue of revenues) {
		const downPaymentValue = revenue.downPaymentValue ?? 0;

		if (downPaymentValue > revenue.totalValue) {
			throw new Error(CONTRACT_ERRORS.CONTRACT_DOWN_PAYMENT_TOO_HIGH);
		}
	}
}

export function assertContractWriteRules(input: ContractWriteInput) {
	assertContractHasActiveAssignment(input.assignments);
	assertContractHasActiveRevenue(input.revenues);
	assertContractRevenueLimit(input.revenues);
	assertContractUniqueActiveRevenueTypes(input.revenues);
	assertContractUniqueActiveAssignments(input.assignments);
	assertContractRevenueDownPayment(input.revenues);
}
