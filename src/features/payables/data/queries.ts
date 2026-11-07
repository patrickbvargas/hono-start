import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";
import {
	assertCan,
	hasPermission,
	type LoggedUserSession,
} from "@/shared/session";
import { PAYABLE_ERRORS } from "../constants/errors";
import type {
	PayableOptions,
	PayablePage,
	PayablePayment,
	PayableSummary,
} from "../schemas/model";
import {
	payableOptionsSchema,
	payablePageSchema,
	payablePaymentSchema,
	payableSummarySchema,
} from "../schemas/model";
import type { PayableSearch } from "../schemas/search";
import { getPayableToday } from "../utils/date";

function getPayableBase(session: LoggedUserSession) {
	assertCan(session, ["org:payables:read_all", "org:payables:read_own"]);
	const firmId = session.firm.id;
	const assignmentTypes =
		session.employeeType?.value === "LAWYER"
			? ["RESPONSIBLE", "RECOMMENDED"]
			: session.employeeType?.value === "ADMIN_ASSISTANT"
				? ["ADMIN_ASSISTANT"]
				: [""];
	const assigned = Prisma.sql`EXISTS (
 SELECT 1 FROM contract_assignments ca JOIN ref_assignment_types at ON at.id = ca."assignmentTypeId"
 JOIN employee_profiles ep ON ep.id = ca."employeeProfileId" JOIN ref_employee_types et ON et.id = ep."employeeTypeId"
 WHERE ca."contractId" = ca_origin."contractId" AND ca."firmId" = r."firmId" AND ca."employeeProfileId" = ${session.employee.id ?? -1}
 AND ca."isActive" = TRUE AND ca."deletedAt" IS NULL AND at.value IN (${Prisma.join(assignmentTypes)}) AND et.value = ${session.employeeType?.value ?? ""})`;
	return Prisma.sql`WITH base AS (
 SELECT r.id, ${assigned} AS "isAssignedToActor", r."beneficiaryId", cp."personId" AS "beneficiaryPersonId", p."fullName" AS "beneficiaryName", ca_origin."contractId", c."processNumber", epb."expenseId", (rb.id IS NOT NULL) AS "isRemuneration", CASE WHEN rb.id IS NOT NULL THEN 'remuneration' WHEN epb.id IS NOT NULL THEN 'expense' ELSE 'direct' END AS origin,
 r.kind::text AS kind, r."dueDate"::text AS "dueDate", r.amount, COALESCE(s.principal, 0) AS "principalAbated",
 CASE WHEN r."cancelledAt" IS NOT NULL THEN 0 ELSE r.amount - COALESCE(s.principal, 0) END AS balance,
 COALESCE(s.cash, 0) AS "cashPaid", a.id AS "analyticId", pm.id AS "methodId", a.label AS analytic, a.value AS "analyticValue", pm.label AS "expectedMethod", pm.value AS "expectedMethodValue",
 r.notes, r."cancelledAt"::text AS "cancelledAt", r."cancellationReason", r."createdAt"::text AS "createdAt", r."updatedAt"::text AS "updatedAt",
 (r."cancelledAt" IS NULL AND COALESCE(s.principal, 0) > 0 AND COALESCE(s.principal, 0) < r.amount) AS "isPartial",
 CASE WHEN r."cancelledAt" IS NOT NULL THEN 'cancelled'
 WHEN r.amount - COALESCE(s.principal, 0) = 0 THEN 'settled'
 WHEN r."dueDate" < ${getPayableToday()}::date THEN 'overdue'
 WHEN COALESCE(s.principal, 0) > 0 THEN 'partial' ELSE 'pending' END AS situation
 FROM payables r JOIN supplier_profiles cp ON cp.id = r."beneficiaryId" JOIN people p ON p.id = cp."personId"
 JOIN ref_financial_analytics a ON a.id = r."analyticId" JOIN ref_payment_methods pm ON pm.id = r."expectedPaymentMethodId"
 LEFT JOIN expense_payables epb ON epb."payableId" = r.id AND epb."firmId" = r."firmId"
 LEFT JOIN remuneration_payables rb ON rb."payableId" = r.id AND rb."firmId" = r."firmId"
 LEFT JOIN contract_assignments ca_origin ON ca_origin.id = rb."contractAssignmentId" AND ca_origin."firmId" = r."firmId"
 LEFT JOIN contracts c ON c.id = ca_origin."contractId" AND c."firmId" = r."firmId"
 LEFT JOIN LATERAL (SELECT SUM(rc."principalAbated") AS principal, SUM(rc."effectiveAmount") AS cash FROM payments rc
 WHERE rc."payableId" = r.id AND rc."firmId" = r."firmId" AND NOT EXISTS
 (SELECT 1 FROM payment_reversals rv WHERE rv."paymentId" = rc.id AND rv."firmId" = rc."firmId")) s ON TRUE
 WHERE r."firmId" = ${firmId} AND ${hasPermission(session, "org:payables:read_all") ? Prisma.sql`TRUE` : Prisma.sql`cp."personId" = ${session.person?.id ?? -1} AND rb.id IS NOT NULL AND ${assigned}`}
 )`;
}

export function getPayableFilter(search: PayableSearch) {
	const clauses: Prisma.Sql[] = [Prisma.sql`TRUE`];
	if (search.query) {
		const pattern = `%${search.query.replace(/[\\%_]/g, "\\$&")}%`;
		clauses.push(
			Prisma.sql`("beneficiaryName" ILIKE ${pattern} OR notes ILIKE ${pattern} OR "processNumber" ILIKE ${pattern})`,
		);
	}
	if (search.beneficiaryId) {
		clauses.push(Prisma.sql`"beneficiaryId" = ${search.beneficiaryId}`);
	}
	if (search.contractId) {
		clauses.push(Prisma.sql`"contractId" = ${search.contractId}`);
	}
	if (search.origin) {
		clauses.push(Prisma.sql`origin = ${search.origin}`);
	}
	if (search.kind) {
		clauses.push(Prisma.sql`kind = ${search.kind}`);
	}
	if (search.state) {
		clauses.push(
			search.state === "partial"
				? Prisma.sql`"isPartial" = TRUE`
				: Prisma.sql`situation = ${search.state}`,
		);
	}
	if (search.dateFrom) {
		clauses.push(Prisma.sql`"dueDate" >= ${search.dateFrom}`);
	}
	if (search.dateTo) {
		clauses.push(Prisma.sql`"dueDate" <= ${search.dateTo}`);
	}
	if (search.analytic) {
		clauses.push(Prisma.sql`"analyticValue" = ${search.analytic}`);
	}
	if (search.expectedMethod) {
		clauses.push(Prisma.sql`"expectedMethodValue" = ${search.expectedMethod}`);
	}
	return Prisma.join(clauses, " AND ");
}

export async function getPayables(
	session: LoggedUserSession,
	search: PayableSearch,
): Promise<PayablePage> {
	const columns = {
		dueDate: Prisma.sql`"dueDate"`,
		beneficiaryName: Prisma.sql`"beneficiaryName"`,
		amount: Prisma.sql`amount`,
	};
	const direction =
		search.direction === "desc" ? Prisma.sql`DESC` : Prisma.sql`ASC`;
	const [result] = await prisma.$queryRaw<
		Array<{ payload: unknown }>
	>(Prisma.sql`${getPayableBase(session)}, filtered AS (SELECT * FROM base WHERE ${getPayableFilter(search)}),
 page AS (SELECT * FROM filtered ORDER BY ${columns[search.column as keyof typeof columns] ?? columns.dueDate} ${direction}, id ASC LIMIT ${search.limit} OFFSET ${(search.page - 1) * search.limit})
 SELECT json_build_object('data', COALESCE((SELECT json_agg(page) FROM page), '[]'::json), 'total', COUNT(*),
 'totals', json_build_object('amount', COALESCE(SUM(amount) FILTER (WHERE situation <> 'cancelled'), 0),
 'principalAbated', COALESCE(SUM("principalAbated") FILTER (WHERE situation <> 'cancelled'), 0),
 'balance', COALESCE(SUM(balance), 0), 'overdue', COALESCE(SUM(balance) FILTER (WHERE situation = 'overdue'), 0),
 'cancelled', COALESCE(SUM(amount) FILTER (WHERE situation = 'cancelled'), 0))) AS payload FROM filtered`);
	return payablePageSchema.parse(result.payload);
}

export async function getPayableById(
	session: LoggedUserSession,
	id: number,
): Promise<PayableSummary> {
	const [result] = await prisma.$queryRaw<Array<{ payload: unknown }>>(
		Prisma.sql`${getPayableBase(session)} SELECT row_to_json(base) AS payload FROM base WHERE id = ${id}`,
	);
	if (!result) {
		throw new Error(PAYABLE_ERRORS.DETAIL_FAILED);
	}
	return payableSummarySchema.parse(result.payload);
}

export async function getPayableOptions(
	session: LoggedUserSession,
): Promise<PayableOptions> {
	const [result] = await prisma.$queryRaw<
		Array<{ payload: unknown }>
	>(Prisma.sql`${getPayableBase(session)}
 SELECT json_build_object(
 'beneficiaries', COALESCE((SELECT json_agg(o ORDER BY label) FROM (SELECT DISTINCT "beneficiaryId" AS id, "beneficiaryId"::text AS value, "beneficiaryName" AS label, TRUE AS "isActive" FROM base) o), '[]'::json),
 'contracts', COALESCE((SELECT json_agg(o ORDER BY label) FROM (SELECT DISTINCT "contractId" AS id, "contractId"::text AS value, COALESCE("processNumber", '#' || "contractId"::text) AS label, TRUE AS "isActive" FROM base WHERE "contractId" IS NOT NULL) o), '[]'::json),
 'analytics', COALESCE((SELECT json_agg(o ORDER BY label) FROM (SELECT DISTINCT "analyticId" AS id, "analyticValue" AS value, analytic AS label, TRUE AS "isActive" FROM base) o), '[]'::json),
 'methods', COALESCE((SELECT json_agg(o ORDER BY label) FROM (SELECT DISTINCT "methodId" AS id, "expectedMethodValue" AS value, "expectedMethod" AS label, TRUE AS "isActive" FROM base) o), '[]'::json)) AS payload`);
	return payableOptionsSchema.parse(result.payload);
}

export async function getPayablePayments(
	session: LoggedUserSession,
	id: number,
): Promise<PayablePayment[]> {
	await getPayableById(session, id);
	const payments = await prisma.payment.findMany({
		where: { firmId: session.firm.id, payableId: id },
		include: { actualPaymentMethod: true, reversal: true },
		orderBy: [{ effectiveDate: "desc" }, { id: "desc" }],
	});
	return payablePaymentSchema.array().parse(
		payments.map((row) => ({
			id: row.id,
			effectiveDate: row.effectiveDate.toISOString().slice(0, 10),
			principalAbated: Number(row.principalAbated),
			discount: Number(row.discount),
			interest: Number(row.interest),
			penalty: Number(row.penalty),
			effectiveAmount: Number(row.effectiveAmount),
			actualMethod: row.actualPaymentMethod.label,
			reversal: row.reversal
				? {
						effectiveDate: row.reversal.effectiveDate
							.toISOString()
							.slice(0, 10),
						reason: row.reversal.reason,
					}
				: null,
		})),
	);
}
