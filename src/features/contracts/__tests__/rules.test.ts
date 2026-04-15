import { describe, expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import type { ResolvedContractAssignment } from "../api/lookups";
import {
	ASSIGNMENT_TYPE_ADMIN_ASSISTANT_VALUE,
	ASSIGNMENT_TYPE_RECOMMENDED_VALUE,
	ASSIGNMENT_TYPE_RECOMMENDING_VALUE,
	ASSIGNMENT_TYPE_RESPONSIBLE_VALUE,
	EMPLOYEE_TYPE_ADMIN_ASSISTANT_VALUE,
	EMPLOYEE_TYPE_LAWYER_VALUE,
} from "../constants";
import { CONTRACT_ERRORS } from "../constants/errors";
import {
	validateContractWriteRules,
	validateResolvedContractWriteRules,
} from "../rules";
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

describe("validateContractWriteRules", () => {
	it("requires at least one active assignment", () => {
		expect(
			validateContractWriteRules(
				createContractInput({
					assignments: [createAssignment({ isActive: false })],
				}),
			),
		).toContainEqual({
			path: ["assignments"],
			message: CONTRACT_ERRORS.CONTRACT_ASSIGNMENT_REQUIRED,
		});
	});

	it("requires at least one active revenue", () => {
		expect(
			validateContractWriteRules(
				createContractInput({
					revenues: [createRevenue({ isActive: false })],
				}),
			),
		).toContainEqual({
			path: ["revenues"],
			message: CONTRACT_ERRORS.CONTRACT_REVENUE_REQUIRED,
		});
	});

	it("rejects duplicate active assignments", () => {
		expect(
			validateContractWriteRules(
				createContractInput({
					assignments: [createAssignment(), createAssignment()],
				}),
			),
		).toContainEqual({
			path: ["assignments"],
			message: CONTRACT_ERRORS.CONTRACT_ASSIGNMENT_DUPLICATE,
		});
	});

	it("rejects duplicate active revenue types", () => {
		expect(
			validateContractWriteRules(
				createContractInput({
					revenues: [createRevenue(), createRevenue()],
				}),
			),
		).toContainEqual({
			path: ["revenues"],
			message: CONTRACT_ERRORS.CONTRACT_REVENUE_TYPE_DUPLICATE,
		});
	});

	it("rejects down payment above total value", () => {
		expect(
			validateContractWriteRules(
				createContractInput({
					revenues: [createRevenue({ totalValue: 500, downPaymentValue: 600 })],
				}),
			),
		).toContainEqual({
			path: ["revenues", 0, "downPaymentValue"],
			message: CONTRACT_ERRORS.CONTRACT_DOWN_PAYMENT_TOO_HIGH,
		});
	});
});

describe("validateResolvedContractWriteRules", () => {
	it("requires a responsible lawyer", () => {
		expect(
			validateResolvedContractWriteRules([
				createResolvedAssignment({
					assignmentTypeValue: ASSIGNMENT_TYPE_RECOMMENDING_VALUE,
				}),
				createResolvedAssignment({
					employeeId: "2",
					assignmentTypeValue: ASSIGNMENT_TYPE_RECOMMENDED_VALUE,
				}),
			]),
		).toContainEqual({
			path: ["assignments"],
			message: CONTRACT_ERRORS.CONTRACT_RESPONSIBLE_LAWYER_REQUIRED,
		});
	});

	it("rejects admin assistants using non-admin assignments", () => {
		expect(
			validateResolvedContractWriteRules([
				createResolvedAssignment({
					employeeTypeValue: EMPLOYEE_TYPE_ADMIN_ASSISTANT_VALUE,
					assignmentTypeValue: ASSIGNMENT_TYPE_RESPONSIBLE_VALUE,
				}),
			]),
		).toContainEqual({
			path: ["assignments", 0, "assignmentType"],
			message: CONTRACT_ERRORS.CONTRACT_ADMIN_ASSISTANT_ASSIGNMENT,
		});
	});

	it("rejects lawyers using admin-assistant assignments", () => {
		expect(
			validateResolvedContractWriteRules([
				createResolvedAssignment({
					assignmentTypeValue: ASSIGNMENT_TYPE_ADMIN_ASSISTANT_VALUE,
				}),
			]),
		).toContainEqual({
			path: ["assignments", 0, "assignmentType"],
			message: CONTRACT_ERRORS.CONTRACT_LAWYER_ASSIGNMENT,
		});
	});

	it("requires a recommended participant when there is a recommender", () => {
		expect(
			validateResolvedContractWriteRules([
				createResolvedAssignment({
					assignmentTypeValue: ASSIGNMENT_TYPE_RESPONSIBLE_VALUE,
				}),
				createResolvedAssignment({
					employeeId: "2",
					assignmentTypeValue: ASSIGNMENT_TYPE_RECOMMENDING_VALUE,
				}),
			]),
		).toContainEqual({
			path: ["assignments"],
			message: CONTRACT_ERRORS.CONTRACT_REFERRAL_RECOMMENDED_REQUIRED,
		});
	});

	it("requires a recommender when there is a recommended participant", () => {
		expect(
			validateResolvedContractWriteRules([
				createResolvedAssignment({
					assignmentTypeValue: ASSIGNMENT_TYPE_RESPONSIBLE_VALUE,
				}),
				createResolvedAssignment({
					employeeId: "2",
					assignmentTypeValue: ASSIGNMENT_TYPE_RECOMMENDED_VALUE,
				}),
			]),
		).toContainEqual({
			path: ["assignments"],
			message: CONTRACT_ERRORS.CONTRACT_REFERRAL_RECOMMENDING_REQUIRED,
		});
	});

	it("rejects referral percentage above recommended remuneration percentage", () => {
		expect(
			validateResolvedContractWriteRules([
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
		).toContainEqual({
			path: ["assignments"],
			message: CONTRACT_ERRORS.CONTRACT_REFERRAL_PERCENTAGE_TOO_HIGH,
		});
	});
});
