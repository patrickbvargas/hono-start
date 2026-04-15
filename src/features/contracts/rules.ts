import type { ValidationIssue } from "@/shared/types/validation";
import type { ResolvedContractAssignment } from "./api/lookups";
import {
	ASSIGNMENT_TYPE_ADMIN_ASSISTANT_VALUE,
	ASSIGNMENT_TYPE_RECOMMENDED_VALUE,
	ASSIGNMENT_TYPE_RECOMMENDING_VALUE,
	ASSIGNMENT_TYPE_RESPONSIBLE_VALUE,
	CONTRACT_MAX_REVENUES,
	EMPLOYEE_TYPE_ADMIN_ASSISTANT_VALUE,
	EMPLOYEE_TYPE_LAWYER_VALUE,
} from "./constants";
import { CONTRACT_ERRORS } from "./constants/errors";
import type {
	ContractAssignmentInput,
	ContractCreateInput,
	ContractRevenueInput,
	ContractUpdateInput,
} from "./schemas/form";

type ContractWriteInput = ContractCreateInput | ContractUpdateInput;

interface ResponsibleLawyerAssignmentInput {
	isActive: boolean;
	assignmentTypeValue: string;
	employeeTypeValue: string;
}

function getContractAssignmentsRequiredIssue(
	assignments: ContractAssignmentInput[],
): ValidationIssue | null {
	if (assignments.some((assignment) => assignment.isActive)) {
		return null;
	}

	return {
		path: ["assignments"],
		message: CONTRACT_ERRORS.CONTRACT_ASSIGNMENT_REQUIRED,
	};
}

function getContractRevenuesRequiredIssue(
	revenues: ContractRevenueInput[],
): ValidationIssue | null {
	if (revenues.some((revenue) => revenue.isActive)) {
		return null;
	}

	return {
		path: ["revenues"],
		message: CONTRACT_ERRORS.CONTRACT_REVENUE_REQUIRED,
	};
}

function getContractRevenueLimitIssue(
	revenues: ContractRevenueInput[],
): ValidationIssue | null {
	if (
		revenues.filter((revenue) => revenue.isActive).length <=
		CONTRACT_MAX_REVENUES
	) {
		return null;
	}

	return {
		path: ["revenues"],
		message: CONTRACT_ERRORS.CONTRACT_REVENUE_LIMIT,
	};
}

function getContractUniqueActiveRevenueTypesIssue(
	revenues: ContractRevenueInput[],
): ValidationIssue | null {
	const activeTypes = revenues
		.filter((revenue) => revenue.isActive)
		.map((revenue) => revenue.type);

	if (new Set(activeTypes).size === activeTypes.length) {
		return null;
	}

	return {
		path: ["revenues"],
		message: CONTRACT_ERRORS.CONTRACT_REVENUE_TYPE_DUPLICATE,
	};
}

function getContractUniqueActiveAssignmentsIssue(
	assignments: ContractAssignmentInput[],
): ValidationIssue | null {
	const activeEmployeeIds = assignments
		.filter((assignment) => assignment.isActive)
		.map((assignment) => assignment.employeeId);

	if (new Set(activeEmployeeIds).size === activeEmployeeIds.length) {
		return null;
	}

	return {
		path: ["assignments"],
		message: CONTRACT_ERRORS.CONTRACT_ASSIGNMENT_DUPLICATE,
	};
}

function getContractRevenueDownPaymentIssue(
	revenues: ContractRevenueInput[],
): ValidationIssue | null {
	for (const [index, revenue] of revenues.entries()) {
		const downPaymentValue = revenue.downPaymentValue ?? 0;

		if (downPaymentValue > revenue.totalValue) {
			return {
				path: ["revenues", index, "downPaymentValue"],
				message: CONTRACT_ERRORS.CONTRACT_DOWN_PAYMENT_TOO_HIGH,
			};
		}
	}

	return null;
}

function getContractResponsibleLawyerIssue(
	assignments: ResponsibleLawyerAssignmentInput[],
): ValidationIssue | null {
	const hasResponsibleLawyer = assignments.some(
		(assignment) =>
			assignment.isActive &&
			assignment.assignmentTypeValue === ASSIGNMENT_TYPE_RESPONSIBLE_VALUE &&
			assignment.employeeTypeValue === EMPLOYEE_TYPE_LAWYER_VALUE,
	);

	if (hasResponsibleLawyer) {
		return null;
	}

	return {
		path: ["assignments"],
		message: CONTRACT_ERRORS.CONTRACT_RESPONSIBLE_LAWYER_REQUIRED,
	};
}

function getContractAssignmentCompatibilityIssue(
	assignments: ResolvedContractAssignment[],
): ValidationIssue | null {
	for (const [index, assignment] of assignments.entries()) {
		if (!assignment.isActive) {
			continue;
		}

		const employeeTypeValue = assignment.employee.type.value;

		if (
			employeeTypeValue === EMPLOYEE_TYPE_ADMIN_ASSISTANT_VALUE &&
			assignment.assignmentType.value !== ASSIGNMENT_TYPE_ADMIN_ASSISTANT_VALUE
		) {
			return {
				path: ["assignments", index, "assignmentType"],
				message: CONTRACT_ERRORS.CONTRACT_ADMIN_ASSISTANT_ASSIGNMENT,
			};
		}

		if (
			employeeTypeValue === EMPLOYEE_TYPE_LAWYER_VALUE &&
			assignment.assignmentType.value === ASSIGNMENT_TYPE_ADMIN_ASSISTANT_VALUE
		) {
			return {
				path: ["assignments", index, "assignmentType"],
				message: CONTRACT_ERRORS.CONTRACT_LAWYER_ASSIGNMENT,
			};
		}
	}

	return null;
}

function getContractReferralTeamCompositionIssue(
	assignments: ResolvedContractAssignment[],
): ValidationIssue | null {
	const activeAssignments = assignments.filter(
		(assignment) => assignment.isActive,
	);
	const recommendingAssignments = activeAssignments.filter(
		(assignment) =>
			assignment.assignmentType.value === ASSIGNMENT_TYPE_RECOMMENDING_VALUE,
	);
	const recommendedAssignments = activeAssignments.filter(
		(assignment) =>
			assignment.assignmentType.value === ASSIGNMENT_TYPE_RECOMMENDED_VALUE,
	);

	if (
		recommendingAssignments.length > 0 &&
		recommendedAssignments.length === 0
	) {
		return {
			path: ["assignments"],
			message: CONTRACT_ERRORS.CONTRACT_REFERRAL_RECOMMENDED_REQUIRED,
		};
	}

	if (
		recommendedAssignments.length > 0 &&
		recommendingAssignments.length === 0
	) {
		return {
			path: ["assignments"],
			message: CONTRACT_ERRORS.CONTRACT_REFERRAL_RECOMMENDING_REQUIRED,
		};
	}

	return null;
}

function getContractReferralPercentageCompatibilityIssue(
	assignments: ResolvedContractAssignment[],
): ValidationIssue | null {
	const activeAssignments = assignments.filter(
		(assignment) => assignment.isActive,
	);
	const recommendingAssignments = activeAssignments.filter(
		(assignment) =>
			assignment.assignmentType.value === ASSIGNMENT_TYPE_RECOMMENDING_VALUE,
	);
	const recommendedAssignments = activeAssignments.filter(
		(assignment) =>
			assignment.assignmentType.value === ASSIGNMENT_TYPE_RECOMMENDED_VALUE,
	);

	for (const recommendingAssignment of recommendingAssignments) {
		const recommendingReferralPercentage = Number(
			recommendingAssignment.employee.referralPercentage,
		);

		for (const recommendedAssignment of recommendedAssignments) {
			const recommendedRemunerationPercentage = Number(
				recommendedAssignment.employee.remunerationPercentage,
			);

			if (recommendingReferralPercentage > recommendedRemunerationPercentage) {
				return {
					path: ["assignments"],
					message: CONTRACT_ERRORS.CONTRACT_REFERRAL_PERCENTAGE_TOO_HIGH,
				};
			}
		}
	}

	return null;
}

export function validateContractWriteRules(
	input: ContractWriteInput,
): ValidationIssue[] {
	const issues: ValidationIssue[] = [];

	const assignmentsRequiredIssue = getContractAssignmentsRequiredIssue(
		input.assignments,
	);
	if (assignmentsRequiredIssue) {
		issues.push(assignmentsRequiredIssue);
	}

	const revenuesRequiredIssue = getContractRevenuesRequiredIssue(input.revenues);
	if (revenuesRequiredIssue) {
		issues.push(revenuesRequiredIssue);
	}

	const revenueLimitIssue = getContractRevenueLimitIssue(input.revenues);
	if (revenueLimitIssue) {
		issues.push(revenueLimitIssue);
	}

	const uniqueRevenueTypesIssue = getContractUniqueActiveRevenueTypesIssue(
		input.revenues,
	);
	if (uniqueRevenueTypesIssue) {
		issues.push(uniqueRevenueTypesIssue);
	}

	const uniqueAssignmentsIssue = getContractUniqueActiveAssignmentsIssue(
		input.assignments,
	);
	if (uniqueAssignmentsIssue) {
		issues.push(uniqueAssignmentsIssue);
	}

	const revenueDownPaymentIssue = getContractRevenueDownPaymentIssue(
		input.revenues,
	);
	if (revenueDownPaymentIssue) {
		issues.push(revenueDownPaymentIssue);
	}

	return issues;
}

export function validateResolvedContractWriteRules(
	assignments: ResolvedContractAssignment[],
): ValidationIssue[] {
	const issues: ValidationIssue[] = [];

	const assignmentCompatibilityIssue =
		getContractAssignmentCompatibilityIssue(assignments);
	if (assignmentCompatibilityIssue) {
		issues.push(assignmentCompatibilityIssue);
	}

	const referralTeamCompositionIssue =
		getContractReferralTeamCompositionIssue(assignments);
	if (referralTeamCompositionIssue) {
		issues.push(referralTeamCompositionIssue);
	}

	const referralPercentageCompatibilityIssue =
		getContractReferralPercentageCompatibilityIssue(assignments);
	if (referralPercentageCompatibilityIssue) {
		issues.push(referralPercentageCompatibilityIssue);
	}

	const responsibleLawyerIssue = getContractResponsibleLawyerIssue(
		assignments.map((assignment) => ({
			isActive: assignment.isActive,
			assignmentTypeValue: assignment.assignmentType.value,
			employeeTypeValue: assignment.employee.type.value,
		})),
	);
	if (responsibleLawyerIssue) {
		issues.push(responsibleLawyerIssue);
	}

	return issues;
}
