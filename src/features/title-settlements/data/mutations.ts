import { createAuditLog } from "@/features/audit-logs";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";
import type { LoggedUserSession } from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { SETTLEMENT_ERRORS } from "../constants/errors";
import { assertSettlementBalance } from "../rules/balance";
import {
	type SettlementCreateInput,
	type SettlementReverseInput,
	settlementCreateInputSchema,
	settlementReverseInputSchema,
} from "../schemas/form";
import { assertSettlementAccess, lockSettlementTitle } from "./queries";
import { generateReceiptRemunerations } from "./remuneration";

async function auditMovement(
	tx: Prisma.TransactionClient,
	session: LoggedUserSession,
	direction: "receivable" | "payable",
	titleId: number,
	action: "SETTLE" | "REVERSE",
	after: unknown,
) {
	await createAuditLog(tx, {
		firmId: session.firm.id,
		actor: {
			id: session.person?.id,
			name: session.user.fullName,
			email: session.user.email,
		},
		action,
		entityType: direction === "receivable" ? "Receivable" : "Payable",
		entityId: titleId,
		entityName: `Título ${direction === "receivable" ? "a receber" : "a pagar"} #${titleId}`,
		description:
			action === "SETTLE"
				? `Registrou baixa do título ${titleId}.`
				: `Estornou baixa do título ${titleId}.`,
		changeData: { after },
	});
}

export async function createSettlement(
	session: LoggedUserSession,
	rawInput: SettlementCreateInput,
): Promise<MutationReturnType> {
	const input = settlementCreateInputSchema.parse(rawInput);
	const firmId = session.firm.id;
	await prisma.$transaction(
		async (tx) => {
			await lockSettlementTitle(tx, firmId, input);
			await assertSettlementAccess(tx, session, input, "create");
			if (!session.person) {
				throw new Error(SETTLEMENT_ERRORS.UNAVAILABLE);
			}
			const method = await tx.paymentMethod.findUnique({
				where: { value: input.actualPaymentMethod },
				select: { id: true, isActive: true },
			});
			const receipt = input.direction === "receivable";
			const prior = receipt
				? await tx.receipt.findFirst({
						where: {
							firmId,
							receivableId: input.titleId,
							requestKey: input.requestKey,
						},
					})
				: await tx.payment.findFirst({
						where: {
							firmId,
							payableId: input.titleId,
							requestKey: input.requestKey,
						},
					});
			if (prior) {
				if (
					prior.effectiveDate.toISOString().slice(0, 10) !==
						input.effectiveDate ||
					prior.actualPaymentMethodId !== method?.id ||
					prior.actorId !== session.person.id ||
					("generatesRemuneration" in prior &&
						prior.generatesRemuneration !== input.generatesRemuneration) ||
					(
						["principalAbated", "discount", "interest", "penalty"] as const
					).some((key) => !prior[key].eq(input[key]))
				) {
					throw new Error(SETTLEMENT_ERRORS.RETRY);
				}
				return;
			}
			if (!method?.isActive) {
				throw new Error(SETTLEMENT_ERRORS.METHOD);
			}
			const title = receipt
				? await tx.receivable.findFirstOrThrow({
						where: { id: input.titleId, firmId },
					})
				: await tx.payable.findFirstOrThrow({
						where: { id: input.titleId, firmId },
					});
			const totals = receipt
				? await tx.receipt.aggregate({
						where: { firmId, receivableId: input.titleId, reversal: null },
						_sum: { principalAbated: true },
					})
				: await tx.payment.aggregate({
						where: { firmId, payableId: input.titleId, reversal: null },
						_sum: { principalAbated: true },
					});
			const principalAbated = new Prisma.Decimal(input.principalAbated);
			assertSettlementBalance(
				title.amount,
				principalAbated,
				totals._sum.principalAbated ?? new Prisma.Decimal(0),
				title.cancelledAt,
			);
			const discount = new Prisma.Decimal(input.discount);
			const interest = new Prisma.Decimal(input.interest);
			const penalty = new Prisma.Decimal(input.penalty);
			const data = {
				firmId,
				actorId: session.person.id,
				requestKey: input.requestKey,
				effectiveDate: new Date(`${input.effectiveDate}T00:00:00.000Z`),
				actualPaymentMethodId: method.id,
				principalAbated,
				discount,
				interest,
				penalty,
				effectiveAmount: principalAbated
					.minus(discount)
					.plus(interest)
					.plus(penalty),
			};
			if (receipt) {
				if (
					input.generatesRemuneration &&
					!(await tx.contractRevenueReceivable.findFirst({
						where: { firmId, receivableId: title.id },
						select: { id: true },
					}))
				) {
					throw new Error(SETTLEMENT_ERRORS.REMUNERATION);
				}
				const movement = await tx.receipt.create({
					data: {
						...data,
						receivableId: title.id,
						generatesRemuneration: input.generatesRemuneration,
					},
				});
				if (input.generatesRemuneration) {
					await generateReceiptRemunerations(tx, session, movement);
				}
				await auditMovement(
					tx,
					session,
					input.direction,
					title.id,
					"SETTLE",
					movement,
				);
			} else {
				const movement = await tx.payment.create({
					data: { ...data, payableId: title.id },
				});
				await auditMovement(
					tx,
					session,
					input.direction,
					title.id,
					"SETTLE",
					movement,
				);
			}
		},
		{ timeout: 15000 },
	);
	return { success: true };
}

export async function reverseSettlement(
	session: LoggedUserSession,
	rawInput: SettlementReverseInput,
): Promise<MutationReturnType> {
	const input = settlementReverseInputSchema.parse(rawInput);
	const firmId = session.firm.id;
	await prisma.$transaction(
		async (tx) => {
			await lockSettlementTitle(tx, firmId, input);
			await assertSettlementAccess(tx, session, input, "reverse");
			if (!session.person) {
				throw new Error(SETTLEMENT_ERRORS.UNAVAILABLE);
			}
			const receipt = input.direction === "receivable";
			const movement = receipt
				? await tx.receipt.findFirst({
						where: {
							id: input.movementId,
							receivableId: input.titleId,
							firmId,
						},
						include: { reversal: true },
					})
				: await tx.payment.findFirst({
						where: { id: input.movementId, payableId: input.titleId, firmId },
						include: { reversal: true },
					});
			if (!movement) {
				throw new Error(SETTLEMENT_ERRORS.UNAVAILABLE);
			}
			if (movement.reversal) {
				const prior = movement.reversal;
				if (
					prior.requestKey === input.requestKey &&
					prior.reason === input.reason &&
					prior.effectiveDate.toISOString().slice(0, 10) ===
						input.effectiveDate &&
					prior.actorId === session.person.id
				) {
					return;
				}
				throw new Error(SETTLEMENT_ERRORS.REVERSED);
			}
			if (
				input.effectiveDate < movement.effectiveDate.toISOString().slice(0, 10)
			) {
				throw new Error(SETTLEMENT_ERRORS.DATE);
			}
			if (receipt) {
				const dependencies = await tx.remunerationPayable.findMany({
					where: { firmId, receiptId: movement.id },
					orderBy: { payableId: "asc" },
					select: { payableId: true },
				});
				for (const dependency of dependencies) {
					await lockSettlementTitle(tx, firmId, {
						direction: "payable",
						titleId: dependency.payableId,
					});
				}
				for (const dependency of dependencies) {
					if (
						await tx.payment.findFirst({
							where: {
								firmId,
								payableId: dependency.payableId,
								reversal: null,
							},
							select: { id: true },
						})
					) {
						throw new Error(SETTLEMENT_ERRORS.DEPENDENCY);
					}
					const payable = await tx.payable.update({
						where: { firmId_id: { firmId, id: dependency.payableId } },
						data: { cancelledAt: new Date(), cancellationReason: input.reason },
					});
					await createAuditLog(tx, {
						firmId,
						actor: {
							id: session.person.id,
							name: session.user.fullName,
							email: session.user.email,
						},
						action: "CANCEL",
						entityType: "Payable",
						entityId: payable.id,
						entityName: `Título a pagar #${payable.id}`,
						description: `Cancelou remuneração pelo estorno do recebimento ${movement.id}.`,
						changeData: { after: payable },
					});
				}
			}
			const data = {
				firmId,
				actorId: session.person.id,
				effectiveDate: new Date(`${input.effectiveDate}T00:00:00.000Z`),
				reason: input.reason,
				requestKey: input.requestKey,
			};
			const reversal = receipt
				? await tx.receiptReversal.create({
						data: { ...data, receiptId: movement.id },
					})
				: await tx.paymentReversal.create({
						data: { ...data, paymentId: movement.id },
					});
			await auditMovement(
				tx,
				session,
				input.direction,
				input.titleId,
				"REVERSE",
				reversal,
			);
		},
		{ timeout: 15000 },
	);
	return { success: true };
}
