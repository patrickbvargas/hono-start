import { prisma } from "@/shared/lib/prisma";
import type { FeeAccessResource, LoggedUserSession } from "@/shared/session";
import { assertCan, getServerScope } from "@/shared/session";
import { FEE_ERRORS } from "../constants/errors";

export async function getFeeAccessResourceById(id: number) {
	const scope = getServerScope("fee");
	const fee = await prisma.fee.findFirst({
		where: { id, firmId: scope.firmId },
		select: {
			id: true,
			firmId: true,
			revenueId: true,
			deletedAt: true,
			generatesRemuneration: true,
			revenue: {
				select: {
					contractId: true,
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
								},
							},
						},
					},
				},
			},
			remunerations: {
				where: {
					deletedAt: null,
				},
				select: {
					id: true,
					contractEmployeeId: true,
					isSystemGenerated: true,
				},
			},
		},
	});

	if (!fee) {
		return null;
	}

	return {
		id: fee.id,
		contractId: fee.revenue.contractId,
		revenueId: fee.revenueId,
		deletedAt: fee.deletedAt,
		generatesRemuneration: fee.generatesRemuneration,
		manualRemunerationCount: fee.remunerations.filter(
			(remuneration) => !remuneration.isSystemGenerated,
		).length,
		remunerationCount: fee.remunerations.length,
		resource: {
			firmId: fee.firmId,
			statusValue: fee.revenue.contract.status.value,
			allowStatusChange: fee.revenue.contract.allowStatusChange,
			assignedEmployeeIds: fee.revenue.contract.assignments.map(
				(assignment) => assignment.employeeId,
			),
		} satisfies FeeAccessResource,
	};
}

export async function requireFeeAccessResourceById(id: number) {
	const fee = await getFeeAccessResourceById(id);

	if (!fee) {
		throw new Error(FEE_ERRORS.FEE_NOT_FOUND);
	}

	return fee;
}

export async function assertCanAccessFeeById(
	session: LoggedUserSession,
	action: "fee.view" | "fee.update" | "fee.delete" | "fee.restore",
	id: number,
) {
	const fee = await requireFeeAccessResourceById(id);
	assertCan(session, action, fee.resource);
	return fee;
}
