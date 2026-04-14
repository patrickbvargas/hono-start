import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/shared/lib/prisma";
import {
	assertCan,
	getServerLoggedUserSession,
	getServerScope,
	isAdminSession,
} from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { CONTRACT_STATUS_ACTIVE_VALUE } from "../constants";
import { contractCreateSchema } from "../schemas/form";
import { normalizeOptionalText } from "../utils/normalization";
import { assertContractWritePayload } from "../utils/validation";
import {
	resolveContractAssignments,
	resolveContractLookupSelections,
	resolveRevenueTypes,
	validateContractLookupSelections,
} from "./lookups";

const createContract = createServerFn({ method: "POST" })
	.inputValidator(contractCreateSchema)
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
				(error.message.includes("cliente") ||
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
					error.message.includes("processo"))
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
