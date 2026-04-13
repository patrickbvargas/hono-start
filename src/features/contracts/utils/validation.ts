import type {
	ContractStatus,
	LegalArea,
	Prisma,
	PrismaClient,
} from "@/generated/prisma/client";
import {
	ASSIGNMENT_TYPE_ADMIN_ASSISTANT_VALUE,
	ASSIGNMENT_TYPE_RECOMMENDED_VALUE,
	ASSIGNMENT_TYPE_RECOMMENDING_VALUE,
	ASSIGNMENT_TYPE_RESPONSIBLE_VALUE,
	CONTRACT_MAX_REVENUES,
	EMPLOYEE_TYPE_ADMIN_ASSISTANT_VALUE,
	EMPLOYEE_TYPE_LAWYER_VALUE,
} from "../constants";
import type {
	ContractAssignmentInput,
	ContractCreate,
	ContractRevenueInput,
	ContractUpdate,
} from "../schemas/form";

type ContractWriteInput = ContractCreate | ContractUpdate;
type EmployeeWithType = Prisma.EmployeeGetPayload<{
	include: { type: true };
}>;

interface ContractLookupSelection {
	legalArea: LegalArea;
	status: ContractStatus;
}

interface ContractLookupSelectionInput {
	legalArea: string;
	status: string;
}

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

export function assertContractPayloadHasAssignments(
	assignments: ContractAssignmentInput[],
) {
	if (assignments.filter((assignment) => assignment.isActive).length === 0) {
		throw new Error("Informe pelo menos um colaborador");
	}
}

export function assertContractPayloadHasRevenues(
	revenues: ContractRevenueInput[],
) {
	if (revenues.filter((revenue) => revenue.isActive).length === 0) {
		throw new Error("Informe pelo menos uma receita");
	}
}

export function assertRevenueLimit(revenues: ContractRevenueInput[]) {
	if (
		revenues.filter((revenue) => revenue.isActive).length >
		CONTRACT_MAX_REVENUES
	) {
		throw new Error("O contrato permite no máximo três receitas");
	}
}

export function assertUniqueActiveRevenueTypes(
	revenues: ContractRevenueInput[],
) {
	const activeTypes = revenues
		.filter((revenue) => revenue.isActive)
		.map((revenue) => revenue.type);

	if (new Set(activeTypes).size !== activeTypes.length) {
		throw new Error("Não é permitido repetir tipos de receita ativos");
	}
}

export function assertUniqueActiveAssignments(
	assignments: ContractAssignmentInput[],
) {
	const activeEmployeeIds = assignments
		.filter((assignment) => assignment.isActive)
		.map((assignment) => assignment.employeeId);

	if (new Set(activeEmployeeIds).size !== activeEmployeeIds.length) {
		throw new Error(
			"O mesmo colaborador não pode ser atribuído mais de uma vez",
		);
	}
}

export function assertRevenueDownPaymentBounds(
	revenues: ContractRevenueInput[],
) {
	for (const revenue of revenues) {
		const downPaymentValue = revenue.downPaymentValue ?? 0;

		if (downPaymentValue > revenue.totalValue) {
			throw new Error("A entrada não pode ser maior que o valor total");
		}
	}
}

export function assertResponsibleLawyerPresence(
	assignments: Array<{
		isActive: boolean;
		assignmentTypeValue: string;
		employeeTypeValue: string;
	}>,
) {
	const hasResponsibleLawyer = assignments.some(
		(assignment) =>
			assignment.isActive &&
			assignment.assignmentTypeValue === ASSIGNMENT_TYPE_RESPONSIBLE_VALUE &&
			assignment.employeeTypeValue === EMPLOYEE_TYPE_LAWYER_VALUE,
	);

	if (!hasResponsibleLawyer) {
		throw new Error("Informe ao menos um advogado responsável");
	}
}

export function assertAssignmentCompatibility(
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
			throw new Error(
				"Assistentes administrativos só podem usar a atribuição correspondente",
			);
		}

		if (
			employeeTypeValue === EMPLOYEE_TYPE_LAWYER_VALUE &&
			assignment.assignmentType.value === ASSIGNMENT_TYPE_ADMIN_ASSISTANT_VALUE
		) {
			throw new Error(
				"Advogados não podem usar a atribuição de assistente administrativo",
			);
		}
	}
}

export function assertReferralTeamComposition(
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
		throw new Error(
			"Contratos com indicação precisam informar ao menos um indicado",
		);
	}

	if (
		recommendedAssignments.length > 0 &&
		recommendingAssignments.length === 0
	) {
		throw new Error(
			"Contratos com indicado precisam informar ao menos um indicante",
		);
	}
}

export function assertReferralPercentageCompatibility(
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
		const recommendingReferralPercentage = Number(
			recommendingAssignment.employee.referralPercentage,
		);

		for (const recommendedAssignment of recommendedAssignments) {
			const recommendedRemunerationPercentage = Number(
				recommendedAssignment.employee.remunerationPercentage,
			);

			if (recommendingReferralPercentage > recommendedRemunerationPercentage) {
				throw new Error(
					"O percentual de indicação não pode exceder o percentual de remuneração do indicado",
				);
			}
		}
	}
}

export function assertContractWritePayload(
	input: ContractWriteInput,
	assignments: ResolvedContractAssignment[],
) {
	assertContractPayloadHasAssignments(input.assignments);
	assertContractPayloadHasRevenues(input.revenues);
	assertRevenueLimit(input.revenues);
	assertUniqueActiveAssignments(input.assignments);
	assertUniqueActiveRevenueTypes(input.revenues);
	assertRevenueDownPaymentBounds(input.revenues);
	assertAssignmentCompatibility(assignments);
	assertReferralTeamComposition(assignments);
	assertReferralPercentageCompatibility(assignments);
	assertResponsibleLawyerPresence(
		assignments.map((assignment) => ({
			isActive: assignment.isActive,
			assignmentTypeValue: assignment.assignmentType.value,
			employeeTypeValue: assignment.employee.type.value,
		})),
	);
}

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
