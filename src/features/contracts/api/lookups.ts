import type {
	ContractStatus,
	LegalArea,
	Prisma,
	PrismaClient,
} from "@/generated/prisma/client";
import { CONTRACT_ERRORS } from "../constants/errors";
import type {
	ContractAssignmentInput,
	ContractRevenueInput,
} from "../schemas/form";

interface ContractLookupSelection {
	legalArea: LegalArea;
	status: ContractStatus;
}

interface ContractLookupSelectionInput {
	legalArea: string;
	status: string;
}

type EmployeeWithType = Prisma.EmployeeGetPayload<{
	include: { type: true };
}>;

export type ResolvedContractAssignment = Omit<
	ContractAssignmentInput,
	"assignmentType"
> & {
	assignmentType: {
		id: number;
		value: string;
		label: string;
		isActive: boolean;
	};
	employee: EmployeeWithType;
};

export type ResolvedContractRevenue = Omit<ContractRevenueInput, "type"> & {
	type: {
		id: number;
		value: string;
		label: string;
		isActive: boolean;
	};
};

export function validateContractLookupSelections(
	selection: ContractLookupSelection,
	options: {
		currentLegalAreaId?: number;
		currentStatusId?: number;
	} = {},
) {
	if (
		!selection.legalArea.isActive &&
		selection.legalArea.id !== options.currentLegalAreaId
	) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_LEGAL_AREA_INACTIVE);
	}

	if (
		!selection.status.isActive &&
		selection.status.id !== options.currentStatusId
	) {
		throw new Error(CONTRACT_ERRORS.CONTRACT_STATUS_INACTIVE);
	}
}

export async function resolveContractLookupSelections(
	prisma: PrismaClient,
	input: ContractLookupSelectionInput,
) {
	const [legalArea, status] = await Promise.all([
		prisma.legalArea.findUnique({ where: { value: input.legalArea } }),
		prisma.contractStatus.findUnique({ where: { value: input.status } }),
	]);

	if (!legalArea) throw new Error(CONTRACT_ERRORS.CONTRACT_NOT_FOUND);
	if (!status) throw new Error(CONTRACT_ERRORS.CONTRACT_NOT_FOUND);

	return { legalArea, status };
}

export async function resolveContractAssignments(
	prisma: PrismaClient,
	firmId: number,
	assignments: ContractAssignmentInput[],
): Promise<ResolvedContractAssignment[]> {
	const employeeIds = assignments.map((assignment) =>
		Number(assignment.employeeId),
	);
	const assignmentTypeValues = assignments.map(
		(assignment) => assignment.assignmentType,
	);

	const [employees, assignmentTypes] = await Promise.all([
		prisma.employee.findMany({
			where: { firmId, id: { in: employeeIds } },
			include: { type: true },
		}),
		prisma.assignmentType.findMany({
			where: { value: { in: assignmentTypeValues } },
		}),
	]);

	return assignments.map((assignment) => {
		const employee = employees.find(
			(item) => item.id === Number(assignment.employeeId),
		);
		const assignmentType = assignmentTypes.find(
			(item) => item.value === assignment.assignmentType,
		);

		if (!employee) {
			throw new Error(CONTRACT_ERRORS.CONTRACT_EMPLOYEE_NOT_FOUND);
		}

		if (employee.deletedAt || !employee.isActive) {
			throw new Error(CONTRACT_ERRORS.CONTRACT_EMPLOYEE_INACTIVE);
		}

		if (!assignmentType) {
			throw new Error(CONTRACT_ERRORS.CONTRACT_ASSIGNMENT_TYPE_NOT_FOUND);
		}

		if (!assignmentType.isActive) {
			throw new Error(CONTRACT_ERRORS.CONTRACT_ASSIGNMENT_TYPE_INACTIVE);
		}

		return {
			...assignment,
			employee,
			assignmentType,
		};
	});
}

export async function resolveRevenueTypes(
	prisma: PrismaClient,
	revenues: ContractRevenueInput[],
): Promise<ResolvedContractRevenue[]> {
	const revenueTypeValues = revenues.map((revenue) => revenue.type);
	const revenueTypes = await prisma.revenueType.findMany({
		where: { value: { in: revenueTypeValues } },
	});

	return revenues.map((revenue) => {
		const type = revenueTypes.find((item) => item.value === revenue.type);

		if (!type) {
			throw new Error(CONTRACT_ERRORS.CONTRACT_REVENUE_TYPE_NOT_FOUND);
		}

		if (!type.isActive) {
			throw new Error(CONTRACT_ERRORS.CONTRACT_REVENUE_TYPE_INACTIVE);
		}

		return { ...revenue, type };
	});
}
