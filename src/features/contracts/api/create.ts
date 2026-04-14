import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import {
	hasExactErrorMessage,
	isPrismaUniqueConstraintError,
} from "@/shared/lib/error-mapping";
import { prisma } from "@/shared/lib/prisma";
import {
	assertCan,
	getServerLoggedUserSession,
	getServerScope,
	isAdminSession,
} from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { CONTRACT_STATUS_ACTIVE_VALUE } from "../constants";
import { contractCreateInputSchema } from "../schemas/form";
import { normalizeOptionalText } from "../utils/normalization";
import { assertContractWritePayload } from "../utils/validation";
import {
	resolveContractAssignments,
	resolveContractLookupSelections,
	resolveRevenueTypes,
	validateContractLookupSelections,
} from "./lookups";

const createContract = createServerFn({ method: "POST" })
	.inputValidator(contractCreateInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			assertCan(session, "contract.create");
			const { firmId } = getServerScope("contract");
			const isAdmin = isAdminSession(session);

			if (!isAdmin && !data.allowStatusChange) {
				throw new Error(
					"Apenas administradores podem controlar o bloqueio de status",
				);
			}

			const clientId = Number(data.clientId);
			const client = await prisma.client.findFirst({
				where: { id: clientId, firmId, deletedAt: null, isActive: true },
				select: { id: true },
			});

			if (!client) {
				throw new Error("Selecione um cliente ativo");
			}

			const { legalArea, status } = await resolveContractLookupSelections(
				prisma,
				data,
			);
			validateContractLookupSelections({ legalArea, status });

			if (status.value !== CONTRACT_STATUS_ACTIVE_VALUE) {
				throw new Error("Novos contratos devem começar com status ativo");
			}

			const resolvedAssignments = await resolveContractAssignments(
				prisma,
				firmId,
				data.assignments,
			);
			const resolvedRevenues = await resolveRevenueTypes(prisma, data.revenues);
			assertContractWritePayload(data, resolvedAssignments);

			await prisma.$transaction(async (tx) => {
				const contract = await tx.contract.create({
					data: {
						firmId,
						clientId,
						legalAreaId: legalArea.id,
						statusId: status.id,
						processNumber: data.processNumber.trim(),
						feePercentage: data.feePercentage,
						notes: normalizeOptionalText(data.notes),
						allowStatusChange: isAdmin ? data.allowStatusChange : true,
						isActive: data.isActive,
					},
				});

				if (resolvedAssignments.length > 0) {
					await tx.contractEmployee.createMany({
						data: resolvedAssignments.map((assignment) => ({
							firmId,
							contractId: contract.id,
							employeeId: assignment.employee.id,
							assignmentTypeId: assignment.assignmentType.id,
							isActive: assignment.isActive,
						})),
					});
				}

				if (resolvedRevenues.length > 0) {
					await tx.revenue.createMany({
						data: resolvedRevenues.map((revenue) => ({
							firmId,
							contractId: contract.id,
							typeId: revenue.type.id,
							totalValue: revenue.totalValue,
							downPaymentValue: revenue.downPaymentValue,
							paymentStartDate: new Date(revenue.paymentStartDate),
							totalInstallments: revenue.totalInstallments,
							isActive: revenue.isActive,
						})),
					});
				}
			});

			return { success: true };
		} catch (error) {
			console.error("[createContract]", error);
			if (isPrismaUniqueConstraintError(error, ["firmId", "processNumber"])) {
				throw new Error("Este número de processo já está cadastrado");
			}

			if (
				hasExactErrorMessage(error, [
					"Você não tem permissão para criar contratos",
					"Apenas administradores podem controlar o bloqueio de status",
					"Selecione um cliente ativo",
					"Selecione uma área jurídica ativa",
					"Selecione um status de contrato ativo",
					"Novos contratos devem começar com status ativo",
					"Informe pelo menos um colaborador",
					"Informe pelo menos uma receita",
					"O contrato permite no máximo três receitas",
					"Não é permitido repetir tipos de receita ativos",
					"O mesmo colaborador não pode ser atribuído mais de uma vez",
					"A entrada não pode ser maior que o valor total",
					"Colaborador não encontrado",
					"Selecione um colaborador ativo",
					"Tipo de atribuição não encontrado",
					"Selecione um tipo de atribuição ativo",
					"Tipo de receita não encontrado",
					"Selecione um tipo de receita ativo",
					"Assistentes administrativos só podem usar a atribuição correspondente",
					"Advogados não podem usar a atribuição de assistente administrativo",
					"Contratos com indicação precisam informar ao menos um indicado",
					"Contratos com indicado precisam informar ao menos um indicante",
					"O percentual de indicação não pode exceder o percentual de remuneração do indicado",
					"Informe ao menos um advogado responsável",
				])
			) {
				throw error;
			}

			throw new Error("Erro ao criar contrato");
		}
	});

export const createContractOptions = () =>
	mutationOptions({
		mutationFn: createContract,
	});
