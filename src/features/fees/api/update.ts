import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { Prisma } from "@/generated/prisma/client";
import { hasExactErrorMessage } from "@/shared/lib/error-mapping";
import { prisma } from "@/shared/lib/prisma";
import { assertCan, getServerLoggedUserSession } from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { feeUpdateInputSchema } from "../schemas/form";
import { normalizeFeeReference } from "../utils/normalization";
import {
	assertFeeAmountPositive,
	assertFeeInstallmentNumber,
	assertFeeParentConsistency,
	assertUniqueActiveInstallment,
	shouldGenerateFeeRemunerations,
	shouldRecalculateSystemGeneratedRemunerations,
} from "../utils/validation";
import { assertCanAccessFeeById } from "./resource";
import { syncContractStatusFromFees, syncFeeRemunerations } from "./write";

const updateFee = createServerFn({ method: "POST" })
	.inputValidator(feeUpdateInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			const access = await assertCanAccessFeeById(
				session,
				"fee.update",
				data.id,
			);
			const contractId = Number(normalizeFeeReference(data.contractId));
			const revenueId = Number(normalizeFeeReference(data.revenueId));
			const nextRevenue = await prisma.revenue.findFirst({
				where: {
					id: revenueId,
					deletedAt: null,
					firmId: access.resource.firmId,
				},
				select: {
					id: true,
					firmId: true,
					contractId: true,
					totalInstallments: true,
					contract: {
						select: {
							allowStatusChange: true,
							status: {
								select: {
									value: true,
								},
							},
							assignments: {
								where: {
									deletedAt: null,
									isActive: true,
								},
								select: {
									id: true,
									employeeId: true,
									employee: {
										select: {
											referralPercentage: true,
											remunerationPercentage: true,
										},
									},
									assignmentType: {
										select: {
											value: true,
										},
									},
								},
							},
						},
					},
					fees: {
						where: {
							deletedAt: null,
							isActive: true,
						},
						select: {
							id: true,
							installmentNumber: true,
							isActive: true,
							deletedAt: true,
						},
					},
				},
			});

			if (!nextRevenue) {
				throw new Error("Selecione uma receita válida");
			}

			assertFeeParentConsistency({
				contractId,
				revenueContractId: nextRevenue.contractId,
			});

			assertCan(session, "fee.update", {
				firmId: nextRevenue.firmId,
				statusValue: nextRevenue.contract.status.value,
				allowStatusChange: nextRevenue.contract.allowStatusChange,
				assignedEmployeeIds: nextRevenue.contract.assignments.map(
					(assignment) => assignment.employeeId,
				),
			});

			assertFeeAmountPositive(data.amount);
			assertFeeInstallmentNumber(data.installmentNumber);
			assertUniqueActiveInstallment({
				excludeFeeId: data.id,
				fees: nextRevenue.fees,
				installmentNumber: data.installmentNumber,
			});

			if (
				nextRevenue.fees.filter((fee) => fee.id !== data.id).length >=
				nextRevenue.totalInstallments
			) {
				throw new Error(
					"Não é possível lançar honorários após quitar todas as parcelas previstas",
				);
			}

			const isReparenting =
				access.contractId !== nextRevenue.contractId ||
				access.revenueId !== nextRevenue.id;

			if (isReparenting && access.manualRemunerationCount > 0) {
				throw new Error(
					"Não é possível trocar o contrato ou a receita de um honorário com remunerações manuais",
				);
			}

			if (
				isReparenting &&
				access.remunerationCount > 0 &&
				!data.generatesRemuneration
			) {
				throw new Error(
					"Não é possível trocar o contrato ou a receita ao preservar remunerações existentes",
				);
			}

			await prisma.$transaction(async (tx) => {
				await tx.fee.update({
					where: { id: data.id },
					data: {
						revenueId: nextRevenue.id,
						paymentDate: new Date(data.paymentDate),
						amount: data.amount,
						installmentNumber: data.installmentNumber,
						generatesRemuneration: data.generatesRemuneration,
						isActive: data.isActive,
						deletedAt: null,
					},
				});

				if (
					shouldGenerateFeeRemunerations(data.generatesRemuneration) &&
					shouldRecalculateSystemGeneratedRemunerations(
						data.generatesRemuneration,
					)
				) {
					await syncFeeRemunerations({
						tx,
						feeId: data.id,
						firmId: nextRevenue.firmId,
						amount: new Prisma.Decimal(data.amount),
						paymentDate: new Date(data.paymentDate),
						assignments: nextRevenue.contract.assignments,
					});
				}

				await syncContractStatusFromFees(tx, access.contractId);

				if (access.contractId !== nextRevenue.contractId) {
					await syncContractStatusFromFees(tx, nextRevenue.contractId);
				}
			});

			return { success: true };
		} catch (error) {
			console.error("[updateFee]", error);
			if (
				hasExactErrorMessage(error, [
					"Você não tem permissão para editar este honorário",
					"Honorário não encontrado",
					"Selecione uma receita válida",
					"A receita selecionada não pertence ao contrato informado",
					"Valor deve ser maior que zero",
					"Parcela deve ser maior que zero",
					"Já existe um honorário ativo para esta parcela",
					"Não é possível lançar honorários após quitar todas as parcelas previstas",
					"Não é possível trocar o contrato ou a receita de um honorário com remunerações manuais",
					"Não é possível trocar o contrato ou a receita ao preservar remunerações existentes",
				])
			) {
				throw error;
			}

			throw new Error("Erro ao atualizar honorário");
		}
	});

export const updateFeeOptions = () =>
	mutationOptions({
		mutationFn: updateFee,
	});
