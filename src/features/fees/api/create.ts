import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { Prisma } from "@/generated/prisma/client";
import { hasExactErrorMessage } from "@/shared/lib/error-mapping";
import { prisma } from "@/shared/lib/prisma";
import { assertCan, getServerLoggedUserSession } from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { feeCreateInputSchema } from "../schemas/form";
import { normalizeFeeReference } from "../utils/normalization";
import {
	assertFeeAmountPositive,
	assertFeeInstallmentNumber,
	assertFeeParentConsistency,
	assertUniqueActiveInstallment,
	shouldGenerateFeeRemunerations,
} from "../utils/validation";
import { syncContractStatusFromFees, syncFeeRemunerations } from "./write";

const createFee = createServerFn({ method: "POST" })
	.inputValidator(feeCreateInputSchema)
	.handler(async ({ data }): Promise<MutationReturnType> => {
		try {
			const session = getServerLoggedUserSession();
			const contractId = Number(normalizeFeeReference(data.contractId));
			const revenueId = Number(normalizeFeeReference(data.revenueId));

			const revenue = await prisma.revenue.findFirst({
				where: {
					id: revenueId,
					deletedAt: null,
					firmId: session.firm.id,
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

			if (!revenue) {
				throw new Error("Selecione uma receita válida");
			}

			assertFeeParentConsistency({
				contractId,
				revenueContractId: revenue.contractId,
			});

			assertCan(session, "fee.create", {
				firmId: revenue.firmId,
				statusValue: revenue.contract.status.value,
				allowStatusChange: revenue.contract.allowStatusChange,
				assignedEmployeeIds: revenue.contract.assignments.map(
					(assignment) => assignment.employeeId,
				),
			});

			assertFeeAmountPositive(data.amount);
			assertFeeInstallmentNumber(data.installmentNumber);
			assertUniqueActiveInstallment({
				fees: revenue.fees,
				installmentNumber: data.installmentNumber,
			});

			if (revenue.fees.length >= revenue.totalInstallments) {
				throw new Error(
					"Não é possível lançar honorários após quitar todas as parcelas previstas",
				);
			}

			await prisma.$transaction(async (tx) => {
				const fee = await tx.fee.create({
					data: {
						firmId: revenue.firmId,
						revenueId: revenue.id,
						paymentDate: new Date(data.paymentDate),
						amount: data.amount,
						installmentNumber: data.installmentNumber,
						generatesRemuneration: data.generatesRemuneration,
						isActive: data.isActive,
					},
				});

				if (shouldGenerateFeeRemunerations(data.generatesRemuneration)) {
					await syncFeeRemunerations({
						tx,
						feeId: fee.id,
						firmId: revenue.firmId,
						amount: new Prisma.Decimal(data.amount),
						paymentDate: new Date(data.paymentDate),
						assignments: revenue.contract.assignments,
					});
				}

				await syncContractStatusFromFees(tx, revenue.contractId);
			});

			return { success: true };
		} catch (error) {
			console.error("[createFee]", error);
			if (
				hasExactErrorMessage(error, [
					"Você não tem permissão para criar honorários",
					"Selecione uma receita válida",
					"A receita selecionada não pertence ao contrato informado",
					"Valor deve ser maior que zero",
					"Parcela deve ser maior que zero",
					"Já existe um honorário ativo para esta parcela",
					"Não é possível lançar honorários após quitar todas as parcelas previstas",
				])
			) {
				throw error;
			}

			throw new Error("Erro ao criar honorário");
		}
	});

export const createFeeOptions = () =>
	mutationOptions({
		mutationFn: createFee,
	});
