import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { Prisma } from "@/generated/prisma/client";
import { hasExactErrorMessage } from "@/shared/lib/error-mapping";
import { prisma } from "@/shared/lib/prisma";
import { assertCan, getServerLoggedUserSession } from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { FEE_ERRORS } from "../constants/errors";
import {
	validateFeeParentConsistency,
	validateFeeShouldGenerateRemunerations,
	validateUniqueActiveInstallment,
} from "../rules";
import { feeCreateInputSchema } from "../schemas/form";
import { normalizeFeeReference } from "../utils/normalization";
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
				throw new Error(FEE_ERRORS.FEE_SELECT_REVENUE);
			}

			validateFeeParentConsistency({
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

			validateUniqueActiveInstallment({
				fees: revenue.fees,
				installmentNumber: data.installmentNumber,
			});

			if (revenue.fees.length >= revenue.totalInstallments) {
				throw new Error(FEE_ERRORS.FEE_CONTRACT_EXHAUSTED);
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

				if (
					validateFeeShouldGenerateRemunerations(data.generatesRemuneration)
				) {
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
			if (hasExactErrorMessage(error, FEE_ERRORS)) {
				throw error;
			}

			throw new Error(FEE_ERRORS.FEE_CREATE_FAILED);
		}
	});

export const createFeeOptions = () =>
	mutationOptions({
		mutationFn: createFee,
	});
