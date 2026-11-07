import { createAuditLog } from "@/features/audit-logs/data/mutations";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { assertCan, type LoggedUserSession } from "@/shared/session";
import type { MutationReturnType } from "@/shared/types/api";
import { FINANCIAL_TITLE_ERRORS } from "../constants/errors";
import { assertClosureBalance } from "../rules/balance";
import { assertCounterpartyActive } from "../rules/counterparty";
import {
	type DirectPayableCreateInput,
	type DirectReceivableCreateInput,
	directPayableCreateInputSchema,
	directReceivableCreateInputSchema,
	type ExpensePayableGenerationInput,
	expensePayableGenerationInputSchema,
	type RevenueReceivableGenerationInput,
	revenueReceivableGenerationInputSchema,
	type TitleInput,
} from "../schemas/form";

const counterpartySelect = {
	isActive: true,
	person: { select: { isActive: true, deletedAt: true } },
} as const;

async function resolveTitles(
	tx: Prisma.TransactionClient,
	titles: TitleInput[],
) {
	const [analytics, methods] = await Promise.all([
		tx.financialAnalytic.findMany({
			where: {
				value: { in: titles.map((title) => title.analytic) },
				isActive: true,
			},
			select: { id: true, value: true },
		}),
		tx.paymentMethod.findMany({
			where: {
				value: { in: titles.map((title) => title.expectedPaymentMethod) },
				isActive: true,
			},
			select: { id: true, value: true },
		}),
	]);
	return titles.map((title) => {
		const analytic = analytics.find((item) => item.value === title.analytic);
		const method = methods.find(
			(item) => item.value === title.expectedPaymentMethod,
		);
		if (!analytic) {
			throw new Error(FINANCIAL_TITLE_ERRORS.ANALYTIC_UNAVAILABLE);
		}
		if (!method) {
			throw new Error(FINANCIAL_TITLE_ERRORS.PAYMENT_METHOD_UNAVAILABLE);
		}
		return {
			amount: new Prisma.Decimal(String(title.amount)),
			dueDate: new Date(`${title.dueDate}T00:00:00.000Z`),
			analyticId: analytic.id,
			expectedPaymentMethodId: method.id,
			kind: title.kind,
			notes: title.notes || null,
		};
	});
}

async function auditTitle(
	tx: Prisma.TransactionClient,
	session: LoggedUserSession,
	entityType: "Receivable" | "Payable",
	title: { id: number },
	after: unknown,
) {
	await createAuditLog(tx, {
		firmId: session.firm.id,
		actor: {
			id: session.person?.id,
			name: session.user.fullName,
			email: session.user.email,
		},
		action: "CREATE",
		entityType,
		entityId: title.id,
		entityName: `${entityType === "Receivable" ? "Título a receber" : "Título a pagar"} #${title.id}`,
		changeData: { after },
		description: `Criou título ${entityType === "Receivable" ? "a receber" : "a pagar"} ${title.id}.`,
	});
}

export async function generateReceivablesFromRevenue({
	session,
	input: rawInput,
}: {
	session: LoggedUserSession;
	input: RevenueReceivableGenerationInput;
}): Promise<MutationReturnType> {
	const input = revenueReceivableGenerationInputSchema.parse(rawInput);
	const firmId = session.firm.id;
	assertCan(session, "org:receivables:generate", { firmId });
	await prisma.$transaction(async (tx) => {
		// Lock the source before reading its amount or checking existing bridges.
		await tx.$queryRaw`SELECT r.id FROM revenues r
			JOIN contracts c ON c.id = r."contractId" AND c."firmId" = r."firmId"
			WHERE r.id = ${input.revenueId} AND r."firmId" = ${firmId}
			FOR UPDATE OF c, r`;
		const revenue = await tx.revenue.findFirst({
			where: {
				id: input.revenueId,
				firmId,
				isActive: true,
				deletedAt: null,
				contract: { firmId, isActive: true, deletedAt: null },
			},
			select: {
				id: true,
				contractId: true,
				negotiatedAmount: true,
				contract: {
					select: {
						customerId: true,
						customer: { select: counterpartySelect },
						status: { select: { value: true } },
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
								employeeProfile: {
									select: { employeeType: { select: { value: true } } },
								},
								assignmentType: { select: { value: true } },
							},
						},
					},
				},
			},
		});
		if (!revenue) {
			throw new Error(FINANCIAL_TITLE_ERRORS.REVENUE_UNAVAILABLE);
		}
		assertCan(
			session,
			["org:contracts:update_all", "org:contracts:update_assigned"],
			{
				firmId,
				statusValue: revenue.contract.status.value,
				assignments: revenue.contract.assignments.map((assignment) => ({
					employeeId: assignment.employeeProfileId,
					employeeTypeValue: assignment.employeeProfile.employeeType.value,
					assignmentTypeValue: assignment.assignmentType.value,
				})),
			},
		);
		assertCounterpartyActive(revenue.contract.customer);
		assertClosureBalance(revenue.negotiatedAmount, input.titles);
		if (
			await tx.contractRevenueReceivable.findFirst({
				where: { firmId, revenueId: revenue.id },
				select: { id: true },
			})
		) {
			throw new Error(FINANCIAL_TITLE_ERRORS.ALREADY_GENERATED);
		}
		const titles = await resolveTitles(tx, input.titles);
		for (const data of titles) {
			const title = await tx.receivable.create({
				data: { ...data, firmId, debtorId: revenue.contract.customerId },
			});
			const bridge = await tx.contractRevenueReceivable.create({
				data: {
					firmId,
					contractId: revenue.contractId,
					revenueId: revenue.id,
					receivableId: title.id,
				},
			});
			await auditTitle(tx, session, "Receivable", title, { title, bridge });
		}
	});
	return { success: true };
}

export async function generatePayablesFromExpense({
	session,
	input: rawInput,
}: {
	session: LoggedUserSession;
	input: ExpensePayableGenerationInput;
}): Promise<MutationReturnType> {
	const input = expensePayableGenerationInputSchema.parse(rawInput);
	const firmId = session.firm.id;
	assertCan(session, "org:payables:generate", { firmId });
	assertCan(session, ["org:expenses:create", "org:expenses:update"], {
		firmId,
	});
	await prisma.$transaction(async (tx) => {
		await tx.$queryRaw`SELECT id FROM expenses WHERE id = ${input.expenseId} AND "firmId" = ${firmId} FOR UPDATE`;
		const expense = await tx.expense.findFirst({
			where: { id: input.expenseId, firmId, isActive: true, deletedAt: null },
			select: {
				id: true,
				supplierId: true,
				negotiatedAmount: true,
				supplier: { select: counterpartySelect },
			},
		});
		if (!expense) {
			throw new Error(FINANCIAL_TITLE_ERRORS.EXPENSE_UNAVAILABLE);
		}
		assertCounterpartyActive(expense.supplier);
		assertClosureBalance(expense.negotiatedAmount, input.titles);
		if (
			await tx.expensePayable.findFirst({
				where: { firmId, expenseId: expense.id },
				select: { id: true },
			})
		) {
			throw new Error(FINANCIAL_TITLE_ERRORS.ALREADY_GENERATED);
		}
		const titles = await resolveTitles(tx, input.titles);
		for (const data of titles) {
			const title = await tx.payable.create({
				data: { ...data, firmId, beneficiaryId: expense.supplierId },
			});
			const bridge = await tx.expensePayable.create({
				data: { firmId, expenseId: expense.id, payableId: title.id },
			});
			await auditTitle(tx, session, "Payable", title, { title, bridge });
		}
	});
	return { success: true };
}

export async function createDirectReceivable({
	session,
	input: rawInput,
}: {
	session: LoggedUserSession;
	input: DirectReceivableCreateInput;
}): Promise<MutationReturnType> {
	const input = directReceivableCreateInputSchema.parse(rawInput);
	const firmId = session.firm.id;
	assertCan(session, "org:receivables:create", { firmId });
	await prisma.$transaction(async (tx) => {
		const debtor = await tx.clientProfile.findUnique({
			where: { id: input.debtorId },
			select: counterpartySelect,
		});
		assertCounterpartyActive(debtor);
		const [data] = await resolveTitles(tx, [input]);
		const title = await tx.receivable.create({
			data: { ...data, firmId, debtorId: input.debtorId },
		});
		await auditTitle(tx, session, "Receivable", title, { title });
	});
	return { success: true };
}

export async function createDirectPayable({
	session,
	input: rawInput,
}: {
	session: LoggedUserSession;
	input: DirectPayableCreateInput;
}): Promise<MutationReturnType> {
	const input = directPayableCreateInputSchema.parse(rawInput);
	const firmId = session.firm.id;
	assertCan(session, "org:payables:create", { firmId });
	await prisma.$transaction(async (tx) => {
		const beneficiary = await tx.supplierProfile.findUnique({
			where: { id: input.beneficiaryId },
			select: counterpartySelect,
		});
		assertCounterpartyActive(beneficiary);
		const [data] = await resolveTitles(tx, [input]);
		const title = await tx.payable.create({
			data: { ...data, firmId, beneficiaryId: input.beneficiaryId },
		});
		await auditTitle(tx, session, "Payable", title, { title });
	});
	return { success: true };
}
