import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";
import {
	getServerLoggedUserSession,
	isAdminSession,
	isContractReadOnly,
} from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import {
	CONTRACT_STATUS_CANCELLED_VALUE,
	CONTRACT_STATUS_COMPLETED_VALUE,
} from "../constants";
import { contractUpdateInputSchema } from "../schemas/form";
import { normalizeOptionalText } from "../utils/normalization";
import { assertContractWritePayload } from "../utils/validation";
import {
	type ResolvedContractAssignment,
	type ResolvedContractRevenue,
	resolveContractAssignments,
	resolveContractLookupSelections,
	resolveRevenueTypes,
	validateContractLookupSelections,
} from "./lookups";
import { assertCanAccessContractById } from "./resource";

async function syncAssignments(
	tx: Prisma.TransactionClient,
	params: {
		contractId: number;
		firmId: number;
		assignments: ResolvedContractAssignment[];
	},
) {
	const existingAssignments = await tx.contractEmployee.findMany({
		where: { contractId: params.contractId },
		select: { id: true },
	});
	const existingIds = new Set(
		existingAssignments.map((assignment) => assignment.id),
	);
	const incomingIds = new Set(
		params.assignments
			.map((assignment) => assignment.id)
			.filter((id): id is number => typeof id === "number"),
	);

	for (const assignment of params.assignments) {
		const data = {
			firmId: params.firmId,
			employeeId: assignment.employee.id,
			assignmentTypeId: assignment.assignmentType.id,
			isActive: assignment.isActive,
			deletedAt: null,
		};

		if (typeof assignment.id === "number" && existingIds.has(assignment.id)) {
			await tx.contractEmployee.update({
				where: { id: assignment.id },
				data,
			});
			continue;
		}

		await tx.contractEmployee.create({
			data: {
				...data,
				contractId: params.contractId,
			},
		});
	}

	for (const assignment of existingAssignments) {
		if (!incomingIds.has(assignment.id)) {
			await tx.contractEmployee.update({
				where: { id: assignment.id },
				data: { deletedAt: new Date() },
			});
		}
	}
}

async function syncRevenues(
	tx: Prisma.TransactionClient,
	params: {
		contractId: number;
		firmId: number;
		revenues: ResolvedContractRevenue[];
	},
) {
	const existingRevenues = await tx.revenue.findMany({
		where: { contractId: params.contractId },
		select: { id: true },
	});
	const existingIds = new Set(existingRevenues.map((revenue) => revenue.id));
	const incomingIds = new Set(
		params.revenues
			.map((revenue) => revenue.id)
			.filter((id): id is number => typeof id === "number"),
	);

	for (const revenue of params.revenues) {
		const data = {
			firmId: params.firmId,
			typeId: revenue.type.id,
			totalValue: revenue.totalValue,
			downPaymentValue: revenue.downPaymentValue,
			paymentStartDate: new Date(revenue.paymentStartDate),
			totalInstallments: revenue.totalInstallments,
			isActive: revenue.isActive,
			deletedAt: null,
		};

		if (typeof revenue.id === "number" && existingIds.has(revenue.id)) {
			await tx.revenue.update({
				where: { id: revenue.id },
				data,
			});
			continue;
		}

		await tx.revenue.create({
			data: {
				...data,
				contractId: params.contractId,
			},
		});
	}

	for (const revenue of existingRevenues) {
		if (!incomingIds.has(revenue.id)) {
			await tx.revenue.update({
				where: { id: revenue.id },
				data: { deletedAt: new Date() },
			});
		}
	}
}

const updateContract = createServerFn({ method: "POST" })
	.inputValidator(contractUpdateInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			const access = await assertCanAccessContractById(
				session,
				"contract.update",
				data.id,
			);
			const isAdmin = isAdminSession(session);

			if (isContractReadOnly(access.resource)) {
				throw new Error(
					"Contratos concluídos ou cancelados são somente leitura",
				);
			}

			const existing = await prisma.contract.findFirst({
				where: { id: data.id, firmId: access.resource.firmId },
				include: {
					status: true,
				},
			});

			if (!existing) {
				throw new Error("Contrato não encontrado");
			}

			if (!isAdmin && data.allowStatusChange !== existing.allowStatusChange) {
				throw new Error(
					"Apenas administradores podem controlar o bloqueio de status",
				);
			}

			const { legalArea, status } = await resolveContractLookupSelections(
				prisma,
				data,
			);
			validateContractLookupSelections(
				{ legalArea, status },
				{
					currentLegalAreaId: existing.legalAreaId,
					currentStatusId: existing.statusId,
				},
			);

			if (!isAdmin && status.id !== existing.statusId) {
				throw new Error(
					"Apenas administradores podem alterar o status do contrato",
				);
			}

			if (status.id !== existing.statusId && !existing.allowStatusChange) {
				throw new Error(
					"As mudanças de status estão bloqueadas para este contrato",
				);
			}

			if (
				existing.status.value === CONTRACT_STATUS_COMPLETED_VALUE ||
				existing.status.value === CONTRACT_STATUS_CANCELLED_VALUE
			) {
				throw new Error(
					"Contratos concluídos ou cancelados são somente leitura",
				);
			}

			const clientId = Number(data.clientId);
			const client = await prisma.client.findFirst({
				where: {
					id: clientId,
					firmId: access.resource.firmId,
					deletedAt: null,
					isActive: true,
				},
				select: { id: true },
			});

			if (!client) {
				throw new Error("Selecione um cliente ativo");
			}

			const resolvedAssignments = await resolveContractAssignments(
				prisma,
				access.resource.firmId,
				data.assignments,
			);
			const resolvedRevenues = await resolveRevenueTypes(prisma, data.revenues);
			assertContractWritePayload(data, resolvedAssignments);

			await prisma.$transaction(async (tx) => {
				await tx.contract.update({
					where: { id: data.id },
					data: {
						clientId,
						legalAreaId: legalArea.id,
						statusId: status.id,
						processNumber: data.processNumber.trim(),
						feePercentage: data.feePercentage,
						notes: normalizeOptionalText(data.notes),
						allowStatusChange: isAdmin
							? data.allowStatusChange
							: existing.allowStatusChange,
						isActive: data.isActive,
					},
				});

				await syncAssignments(tx, {
					contractId: data.id,
					firmId: access.resource.firmId,
					assignments: resolvedAssignments,
				});

				await syncRevenues(tx, {
					contractId: data.id,
					firmId: access.resource.firmId,
					revenues: resolvedRevenues,
				});
			});

			return { success: true };
		} catch (error) {
			console.error("[updateContract]", error);
			if (
				error instanceof Error &&
				error.message.includes("Unique constraint") &&
				error.message.includes("firmId") &&
				error.message.includes("processNumber")
			) {
				throw new Error("Este número de processo já está cadastrado");
			}

			if (
				error instanceof Error &&
				(error.message.includes("Contrato") ||
					error.message.includes("contrato") ||
					error.message.includes("cliente") ||
					error.message.includes("Cliente") ||
					error.message.includes("status") ||
					error.message.includes("Status") ||
					error.message.includes("área") ||
					error.message.includes("Área") ||
					error.message.includes("colaborador") ||
					error.message.includes("receita") ||
					error.message.includes("advogado") ||
					error.message.includes("atribuição") ||
					error.message.includes("administradores") ||
					error.message.includes("processo") ||
					error.message.includes("leitura"))
			) {
				throw error;
			}

			throw new Error("Erro ao atualizar contrato");
		}
	});

export const updateContractOptions = () =>
	mutationOptions({
		mutationFn: updateContract,
	});
