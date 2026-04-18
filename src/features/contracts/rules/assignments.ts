import { Prisma } from "@/generated/prisma/client";
import {
	ASSIGNMENT_TYPE_ADMIN_ASSISTANT_VALUE,
	ASSIGNMENT_TYPE_RECOMMENDED_VALUE,
	ASSIGNMENT_TYPE_RECOMMENDING_VALUE,
	ASSIGNMENT_TYPE_RESPONSIBLE_VALUE,
	EMPLOYEE_TYPE_ADMIN_ASSISTANT_VALUE,
	EMPLOYEE_TYPE_LAWYER_VALUE,
} from "../constants";
import { CONTRACT_ERRORS } from "../constants/errors";
import type { ResolvedContractAssignment } from "../data/mutations";

interface ResponsibleLawyerAssignmentInput {
	isActive: boolean;
	assignmentTypeValue: string;
	employeeTypeValue: string;
}

export function assertContractResponsibleLawyer(
	assignments: ResponsibleLawyerAssignmentInput[],
) {
	const hasResponsibleLawyer = assignments.some(
		(assignment) =>
			assignment.isActive &&
			assignment.assignmentTypeValue === ASSIGNMENT_TYPE_RESPONSIBLE_VALUE &&
			assignment.employeeTypeValue === EMPLOYEE_TYPE_LAWYER_VALUE,
	);

	if (!hasResponsibleLawyer) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_RESPONSIBLE_LAWYER_REQUIRED);
	}
}

export function assertContractAssignmentCompatibility(
	assignments: ResolvedContractAssignment[],
) {
	for (const assignment of assignments) {
		if (!assignment.isActive) {
			continue;
		}

		const employeeTypeValue = assignment.employee.type.value;

		if (
			employeeTypeValue === EMPLOYEE_TYPE_ADMIN_ASSISTANT_VALUE &&
			assignment.assignmentType.value !== ASSIGNMENT_TYPE_ADMIN_ASSISTANT_VALUE
		) {
			throw new Error(CONTRACT_ERRORS.CONTRACT_ADMIN_ASSISTANT_ASSIGNMENT);
		}

		if (
			employeeTypeValue === EMPLOYEE_TYPE_LAWYER_VALUE &&
			assignment.assignmentType.value === ASSIGNMENT_TYPE_ADMIN_ASSISTANT_VALUE
		) {
			throw new Error(CONTRACT_ERRORS.CONTRACT_LAWYER_ASSIGNMENT);
		}
	}
}

export function assertContractReferralTeamComposition(
	assignments: ResolvedContractAssignment[],
) {
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
		throw new Error(CONTRACT_ERRORS.CONTRACT_REFERRAL_RECOMMENDED_REQUIRED);
	}

	if (
		recommendedAssignments.length > 0 &&
		recommendingAssignments.length === 0
	) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_REFERRAL_RECOMMENDING_REQUIRED);
	}
}

export function assertContractReferralPercentageCompatibility(
	assignments: ResolvedContractAssignment[],
) {
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
		const recommendingReferralPercentage = new Prisma.Decimal(
			recommendingAssignment.employee.referralPercentage,
		);

		for (const recommendedAssignment of recommendedAssignments) {
			const recommendedRemunerationPercentage = new Prisma.Decimal(
				recommendedAssignment.employee.remunerationPercentage,
			);

			if (
				recommendingReferralPercentage.greaterThan(
					recommendedRemunerationPercentage,
				)
			) {
				throw new Error(CONTRACT_ERRORS.CONTRACT_REFERRAL_PERCENTAGE_TOO_HIGH);
			}
		}
	}
}

export function assertResolvedContractAssignmentRules(
	assignments: ResolvedContractAssignment[],
) {
	assertContractAssignmentCompatibility(assignments);
	assertContractReferralTeamComposition(assignments);
	assertContractReferralPercentageCompatibility(assignments);
	assertContractResponsibleLawyer(
		assignments.map((assignment) => ({
			isActive: assignment.isActive,
			assignmentTypeValue: assignment.assignmentType.value,
			employeeTypeValue: assignment.employee.type.value,
		})),
	);
}
