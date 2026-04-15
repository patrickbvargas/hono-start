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
import { CONTRACT_ERRORS } from "../constants/errors";
import { validateResolvedContractWriteRules } from "../rules";
import { contractCreateInputSchema } from "../schemas/form";
import { normalizeOptionalText } from "../utils/normalization";
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
				throw new Error(CONTRACT_ERRORS.CONTRACT_STATUS_LOCK_FORBIDDEN);
			}

			const clientId = Number(data.clientId);
			const client = await prisma.client.findFirst({
				where: { id: clientId, firmId, deletedAt: null, isActive: true },
				select: { id: true },
			});

			if (!client) {
				throw new Error(CONTRACT_ERRORS.CONTRACT_CLIENT_INACTIVE);
			}

			const { legalArea, status } = await resolveContractLookupSelections(
				prisma,
				data,
			);
			validateContractLookupSelections({ legalArea, status });

			if (status.value !== CONTRACT_STATUS_ACTIVE_VALUE) {
				throw new Error(CONTRACT_ERRORS.CONTRACT_NEW_STATUS_REQUIRED);
			}

			const resolvedAssignments = await resolveContractAssignments(
				prisma,
				firmId,
				data.assignments,
			);
			const resolvedRevenues = await resolveRevenueTypes(prisma, data.revenues);
			const issues = validateResolvedContractWriteRules(resolvedAssignments);
			if (issues[0]) {
				throw new Error(issues[0].message);
			}

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
				throw new Error(CONTRACT_ERRORS.CONTRACT_PROCESS_NUMBER_DUPLICATE);
			}

			if (hasExactErrorMessage(error, CONTRACT_ERRORS)) {
				throw error;
			}

			throw new Error(CONTRACT_ERRORS.CONTRACT_CREATE_FAILED);
		}
	});

export const createContractOptions = () =>
	mutationOptions({
		mutationFn: createContract,
	});
