import type {
	ContractStatus,
	LegalArea,
	Prisma,
	PrismaClient,
} from "@/generated/prisma/client";
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
		throw new Error("Selecione uma área jurídica ativa");
	}

	if (
		!selection.status.isActive &&
		selection.status.id !== options.currentStatusId
	) {
		throw new Error("Selecione um status de contrato ativo");
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

	if (!legalArea) throw new Error("Área jurídica não encontrada");
	if (!status) throw new Error("Status do contrato não encontrado");

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
			throw new Error("Colaborador não encontrado");
		}

		if (employee.deletedAt || !employee.isActive) {
			throw new Error("Selecione um colaborador ativo");
		}

		if (!assignmentType) {
			throw new Error("Tipo de atribuição não encontrado");
		}

		if (!assignmentType.isActive) {
			throw new Error("Selecione um tipo de atribuição ativo");
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
			throw new Error("Tipo de receita não encontrado");
		}

		if (!type.isActive) {
			throw new Error("Selecione um tipo de receita ativo");
		}

		return { ...revenue, type };
	});
}
