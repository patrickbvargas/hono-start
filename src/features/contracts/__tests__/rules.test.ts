import { describe, expect, it } from "vitest";
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
import {
	assertContractAssignmentCompatibility,
	assertContractReferralPercentageCompatibility,
	assertContractReferralTeamComposition,
	assertContractResponsibleLawyer,
	assertResolvedContractAssignmentRules,
} from "../rules/assignments";
import {
	assertContractHasActiveAssignment,
	assertContractHasActiveRevenue,
	assertContractRevenueDownPayment,
	assertContractUniqueActiveAssignments,
	assertContractUniqueActiveRevenueTypes,
	assertContractWriteRules,
} from "../rules/write";
import type {
	ContractAssignmentInput,
	ContractCreateInput,
	ContractRevenueInput,
} from "../schemas/form";

function createAssignment(
	overrides: Partial<ContractAssignmentInput> = {},
): ContractAssignmentInput {
	return {
		employeeId: "1",
		assignmentType: ASSIGNMENT_TYPE_RESPONSIBLE_VALUE,
		isActive: true,
		...overrides,
	};
}

function createRevenue(
	overrides: Partial<ContractRevenueInput> = {},
): ContractRevenueInput {
	return {
		type: "MONTHLY",
		totalValue: 1000,
		downPaymentValue: 100,
		paymentStartDate: "2026-01-01",
		totalInstallments: 3,
		isActive: true,
		...overrides,
	};
}

function createContractInput(
	overrides: Partial<ContractCreateInput> = {},
): ContractCreateInput {
	return {
		clientId: "1",
		processNumber: "PROC-001",
		legalArea: "CIVIL",
		status: "ACTIVE",
		feePercentage: 0.3,
		notes: "",
		allowStatusChange: true,
		isActive: true,
		assignments: [createAssignment()],
		revenues: [createRevenue()],
		...overrides,
	};
}

function createResolvedAssignment(options: {
	employeeId?: string;
	assignmentTypeValue?: string;
	employeeTypeValue?: string;
	isActive?: boolean;
	referralPercentage?: number;
	remunerationPercentage?: number;
}): ResolvedContractAssignment {
	return {
		id: 1,
		employeeId: options.employeeId ?? "1",
		assignmentType: {
			id: 1,
			value: options.assignmentTypeValue ?? ASSIGNMENT_TYPE_RESPONSIBLE_VALUE,
			label: "Tipo",
			isActive: true,
		},
		employee: {
			id: Number(options.employeeId ?? "1"),
			type: {
				id: 1,
				label: "Tipo",
				value: options.employeeTypeValue ?? EMPLOYEE_TYPE_LAWYER_VALUE,
				isActive: true,
			},
			referralPercentage: new Prisma.Decimal(options.referralPercentage ?? 0.1),
			remunerationPercentage: new Prisma.Decimal(
				options.remunerationPercentage ?? 0.5,
			),
			fullName: "Maria Silva",
			email: "maria@example.com",
			oabNumber: "RS123456",
			firmId: 1,
			roleId: 1,
			typeId: 1,
			avatarUrl: null,
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			deletedAt: null,
		},
		isActive: options.isActive ?? true,
	};
}

describe("contract write rules", () => {
	it("requires at least one active assignment", () => {
		expect(() =>
			assertContractHasActiveAssignment([
				createAssignment({ isActive: false }),
			]),
		).toThrowError(CONTRACT_ERRORS.CONTRACT_ASSIGNMENT_REQUIRED);
	});

	it("requires at least one active revenue", () => {
		expect(() =>
			assertContractHasActiveRevenue([createRevenue({ isActive: false })]),
		).toThrowError(CONTRACT_ERRORS.CONTRACT_REVENUE_REQUIRED);
	});

	it("rejects duplicate active assignments", () => {
		expect(() =>
			assertContractUniqueActiveAssignments([
				createAssignment(),
				createAssignment(),
			]),
		).toThrowError(CONTRACT_ERRORS.CONTRACT_ASSIGNMENT_DUPLICATE);
	});

	it("rejects duplicate active revenue types", () => {
		expect(() =>
			assertContractUniqueActiveRevenueTypes([
				createRevenue(),
				createRevenue(),
			]),
		).toThrowError(CONTRACT_ERRORS.CONTRACT_REVENUE_TYPE_DUPLICATE);
	});

	it("rejects down payment above total value", () => {
		expect(() =>
			assertContractRevenueDownPayment([
				createRevenue({ totalValue: 500, downPaymentValue: 600 }),
			]),
		).toThrowError(CONTRACT_ERRORS.CONTRACT_DOWN_PAYMENT_TOO_HIGH);
	});

	it("aggregates checks through assertContractWriteRules", () => {
		expect(() =>
			assertContractWriteRules(
				createContractInput({
					assignments: [createAssignment({ isActive: false })],
				}),
			),
		).toThrowError(CONTRACT_ERRORS.CONTRACT_ASSIGNMENT_REQUIRED);
	});
});

describe("contract assignment rules", () => {
	it("requires a responsible lawyer", () => {
		expect(() =>
			assertContractResponsibleLawyer([
				{
					isActive: true,
					assignmentTypeValue: ASSIGNMENT_TYPE_RECOMMENDING_VALUE,
					employeeTypeValue: EMPLOYEE_TYPE_LAWYER_VALUE,
				},
				{
					isActive: true,
					assignmentTypeValue: ASSIGNMENT_TYPE_RECOMMENDED_VALUE,
					employeeTypeValue: EMPLOYEE_TYPE_LAWYER_VALUE,
				},
			]),
		).toThrowError(CONTRACT_ERRORS.CONTRACT_RESPONSIBLE_LAWYER_REQUIRED);
	});

	it("rejects admin assistants using non-admin assignments", () => {
		expect(() =>
			assertContractAssignmentCompatibility([
				createResolvedAssignment({
					employeeTypeValue: EMPLOYEE_TYPE_ADMIN_ASSISTANT_VALUE,
					assignmentTypeValue: ASSIGNMENT_TYPE_RESPONSIBLE_VALUE,
				}),
			]),
		).toThrowError(CONTRACT_ERRORS.CONTRACT_ADMIN_ASSISTANT_ASSIGNMENT);
	});

	it("rejects lawyers using admin-assistant assignments", () => {
		expect(() =>
			assertContractAssignmentCompatibility([
				createResolvedAssignment({
					assignmentTypeValue: ASSIGNMENT_TYPE_ADMIN_ASSISTANT_VALUE,
				}),
			]),
		).toThrowError(CONTRACT_ERRORS.CONTRACT_LAWYER_ASSIGNMENT);
	});

	it("requires a recommended participant when there is a recommender", () => {
		expect(() =>
			assertContractReferralTeamComposition([
				createResolvedAssignment({
					assignmentTypeValue: ASSIGNMENT_TYPE_RESPONSIBLE_VALUE,
				}),
				createResolvedAssignment({
					employeeId: "2",
					assignmentTypeValue: ASSIGNMENT_TYPE_RECOMMENDING_VALUE,
				}),
			]),
		).toThrowError(CONTRACT_ERRORS.CONTRACT_REFERRAL_RECOMMENDED_REQUIRED);
	});

	it("requires a recommender when there is a recommended participant", () => {
		expect(() =>
			assertContractReferralTeamComposition([
				createResolvedAssignment({
					assignmentTypeValue: ASSIGNMENT_TYPE_RESPONSIBLE_VALUE,
				}),
				createResolvedAssignment({
					employeeId: "2",
					assignmentTypeValue: ASSIGNMENT_TYPE_RECOMMENDED_VALUE,
				}),
			]),
		).toThrowError(CONTRACT_ERRORS.CONTRACT_REFERRAL_RECOMMENDING_REQUIRED);
	});

	it("rejects referral percentage above recommended remuneration percentage", () => {
		expect(() =>
			assertContractReferralPercentageCompatibility([
				createResolvedAssignment({
					assignmentTypeValue: ASSIGNMENT_TYPE_RESPONSIBLE_VALUE,
				}),
				createResolvedAssignment({
					employeeId: "2",
					assignmentTypeValue: ASSIGNMENT_TYPE_RECOMMENDING_VALUE,
					referralPercentage: 0.4,
				}),
				createResolvedAssignment({
					employeeId: "3",
					assignmentTypeValue: ASSIGNMENT_TYPE_RECOMMENDED_VALUE,
					remunerationPercentage: 0.2,
				}),
			]),
		).toThrowError(CONTRACT_ERRORS.CONTRACT_REFERRAL_PERCENTAGE_TOO_HIGH);
	});

	it("aggregates checks through assertResolvedContractAssignmentRules", () => {
		expect(() =>
			assertResolvedContractAssignmentRules([
				createResolvedAssignment({
					assignmentTypeValue: ASSIGNMENT_TYPE_ADMIN_ASSISTANT_VALUE,
				}),
			]),
		).toThrowError(CONTRACT_ERRORS.CONTRACT_LAWYER_ASSIGNMENT);
	});
});
