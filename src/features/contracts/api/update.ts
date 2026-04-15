import { mutationOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import type { Prisma } from "@/generated/prisma/client";
import {
	hasExactErrorMessage,
	isPrismaUniqueConstraintError,
} from "@/shared/lib/error-mapping";
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
import { CONTRACT_ERRORS } from "../constants/errors";
import { validateResolvedContractWriteRules } from "../rules";
import { contractUpdateInputSchema } from "../schemas/form";
import { normalizeOptionalText } from "../utils/normalization";
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
				throw new Error(CONTRACT_ERRORS.CONTRACT_READ_ONLY);
			}

			const existing = await prisma.contract.findFirst({
				where: { id: data.id, firmId: access.resource.firmId },
				include: {
					status: true,
				},
			});

			if (!existing) {
				throw new Error(CONTRACT_ERRORS.CONTRACT_NOT_FOUND);
			}

			if (!isAdmin && data.allowStatusChange !== existing.allowStatusChange) {
				throw new Error(CONTRACT_ERRORS.CONTRACT_STATUS_LOCK_FORBIDDEN);
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
				throw new Error(CONTRACT_ERRORS.CONTRACT_STATUS_CHANGE_FORBIDDEN);
			}

			if (status.id !== existing.statusId && !existing.allowStatusChange) {
				throw new Error(CONTRACT_ERRORS.CONTRACT_STATUS_CHANGE_LOCKED);
			}

			if (
				existing.status.value === CONTRACT_STATUS_COMPLETED_VALUE ||
				existing.status.value === CONTRACT_STATUS_CANCELLED_VALUE
			) {
				throw new Error(CONTRACT_ERRORS.CONTRACT_READ_ONLY);
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
				throw new Error(CONTRACT_ERRORS.CONTRACT_CLIENT_INACTIVE);
			}

			const resolvedAssignments = await resolveContractAssignments(
				prisma,
				access.resource.firmId,
				data.assignments,
			);
			const resolvedRevenues = await resolveRevenueTypes(prisma, data.revenues);
			const issues = validateResolvedContractWriteRules(resolvedAssignments);
			if (issues[0]) {
				throw new Error(issues[0].message);
			}

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
			if (isPrismaUniqueConstraintError(error, ["firmId", "processNumber"])) {
				throw new Error(CONTRACT_ERRORS.CONTRACT_PROCESS_NUMBER_DUPLICATE);
			}

			if (hasExactErrorMessage(error, CONTRACT_ERRORS)) {
				throw error;
			}

			throw new Error(CONTRACT_ERRORS.CONTRACT_UPDATE_FAILED);
		}
	});

export const updateContractOptions = () =>
	mutationOptions({
		mutationFn: updateContract,
	});
