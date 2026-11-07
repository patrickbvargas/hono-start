import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { assertCan, type LoggedUserSession } from "@/shared/session";
import { SETTLEMENT_ERRORS } from "../constants/errors";
import type { SettlementTargetInput } from "../schemas/form";
import { settlementOptionsSchema } from "../schemas/model";

export async function assertSettlementAccess(
	tx: Prisma.TransactionClient,
	session: LoggedUserSession,
	target: SettlementTargetInput,
	action: "create" | "reverse",
) {
	const firmId = session.firm.id;
	if (target.direction === "payable") {
		assertCan(
			session,
			action === "create" ? "org:payments:create" : "org:payments:reverse",
			{ firmId },
		);
		const title = await tx.payable.findFirst({
			where: { id: target.titleId, firmId },
			select: { id: true },
		});
		if (!title) {
			throw new Error(SETTLEMENT_ERRORS.UNAVAILABLE);
		}
		return;
	}
	const title = await tx.receivable.findFirst({
		where: { id: target.titleId, firmId },
		select: {
			contractRevenueReceivable: {
				select: {
					contract: {
						select: {
							firmId: true,
							assignments: {
								where: {
									firmId,
									isActive: true,
									deletedAt: null,
									employeeProfile: {
										isActive: true,
										deletedAt: null,
										person: { isActive: true, deletedAt: null },
									},
								},
								select: {
									employeeProfileId: true,
									assignmentType: { select: { value: true } },
									employeeProfile: {
										select: { employeeType: { select: { value: true } } },
									},
								},
							},
						},
					},
				},
			},
		},
	});
	if (!title) {
		throw new Error(SETTLEMENT_ERRORS.UNAVAILABLE);
	}
	const contract = title.contractRevenueReceivable?.contract;
	assertCan(
		session,
		action === "create" ? "org:receipts:create" : "org:receipts:reverse",
		{
			firmId,
			contract: contract
				? {
						firmId,
						assignments: contract.assignments.map((assignment) => ({
							employeeId: assignment.employeeProfileId,
							employeeTypeValue: assignment.employeeProfile.employeeType.value,
							assignmentTypeValue: assignment.assignmentType.value,
						})),
					}
				: undefined,
		},
	);
}

export async function lockSettlementTitle(
	tx: Prisma.TransactionClient,
	firmId: number,
	target: SettlementTargetInput,
) {
	const table =
		target.direction === "receivable"
			? Prisma.sql`receivables`
			: Prisma.sql`payables`;
	await tx.$queryRaw(
		Prisma.sql`SELECT id FROM ${table} WHERE id = ${target.titleId} AND "firmId" = ${firmId} FOR UPDATE`,
	);
}

export async function getSettlementOptions(
	session: LoggedUserSession,
	target: SettlementTargetInput,
) {
	await assertSettlementAccess(prisma, session, target, "create");
	const methods = await prisma.paymentMethod.findMany({
		where: { isActive: true },
		orderBy: [{ label: "asc" }, { id: "asc" }],
		select: { value: true, label: true },
	});
	return settlementOptionsSchema.parse({ methods });
}
