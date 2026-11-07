import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { getScope, type LoggedUserSession } from "@/shared/session";
import { RECEIVABLE_ERRORS } from "../constants/errors";
import type {
	ReceivableOptions,
	ReceivablePage,
	ReceivableReceipt,
	ReceivableSummary,
} from "../schemas/model";
import {
	receivableOptionsSchema,
	receivablePageSchema,
	receivableReceiptSchema,
	receivableSummarySchema,
} from "../schemas/model";
import type { ReceivableSearch } from "../schemas/search";
import { getReceivableToday } from "../utils/date";

function getReceivableBase(session: LoggedUserSession) {
	const scope = getScope(session, "receivable");
	const assignmentTypes =
		session.employeeType?.value === "LAWYER"
			? ["RESPONSIBLE", "RECOMMENDED"]
			: session.employeeType?.value === "ADMIN_ASSISTANT"
				? ["ADMIN_ASSISTANT"]
				: [""];
	const assigned = Prisma.sql`EXISTS (
 SELECT 1 FROM contract_assignments ca JOIN ref_assignment_types at ON at.id = ca."assignmentTypeId"
 JOIN employee_profiles ep ON ep.id = ca."employeeProfileId" JOIN ref_employee_types et ON et.id = ep."employeeTypeId"
 WHERE ca."contractId" = b."contractId" AND ca."firmId" = r."firmId" AND ca."employeeProfileId" = ${session.employee.id ?? -1}
 AND ca."isActive" = TRUE AND ca."deletedAt" IS NULL AND at.value IN (${Prisma.join(assignmentTypes)}) AND et.value = ${session.employeeType?.value ?? ""})`;
	return Prisma.sql`WITH base AS (
 SELECT r.id, ${assigned} AS "isAssignedToActor", r."debtorId", cp."personId" AS "debtorPersonId", p."fullName" AS "debtorName", b."contractId", c."processNumber", b."revenueId",
 r.kind::text AS kind, r."dueDate"::text AS "dueDate", r.amount, COALESCE(s.principal, 0) AS "principalAbated",
 CASE WHEN r."cancelledAt" IS NOT NULL THEN 0 ELSE r.amount - COALESCE(s.principal, 0) END AS balance,
 COALESCE(s.cash, 0) AS "cashReceived", a.id AS "analyticId", pm.id AS "methodId", a.label AS analytic, a.value AS "analyticValue", pm.label AS "expectedMethod", pm.value AS "expectedMethodValue",
 r.notes, r."cancelledAt"::text AS "cancelledAt", r."cancellationReason", r."createdAt"::text AS "createdAt", r."updatedAt"::text AS "updatedAt",
 (r."cancelledAt" IS NULL AND COALESCE(s.principal, 0) > 0 AND COALESCE(s.principal, 0) < r.amount) AS "isPartial",
 CASE WHEN r."cancelledAt" IS NOT NULL THEN 'cancelled'
 WHEN r.amount - COALESCE(s.principal, 0) = 0 THEN 'settled'
 WHEN r."dueDate" < ${getReceivableToday()}::date THEN 'overdue'
 WHEN COALESCE(s.principal, 0) > 0 THEN 'partial' ELSE 'pending' END AS situation
 FROM receivables r JOIN client_profiles cp ON cp.id = r."debtorId" JOIN people p ON p.id = cp."personId"
 JOIN ref_financial_analytics a ON a.id = r."analyticId" JOIN ref_payment_methods pm ON pm.id = r."expectedPaymentMethodId"
 LEFT JOIN contract_revenue_receivables b ON b."receivableId" = r.id AND b."firmId" = r."firmId"
 LEFT JOIN contracts c ON c.id = b."contractId" AND c."firmId" = r."firmId"
 LEFT JOIN LATERAL (SELECT SUM(rc."principalAbated") AS principal, SUM(rc."effectiveAmount") AS cash FROM receipts rc
 WHERE rc."receivableId" = r.id AND rc."firmId" = r."firmId" AND NOT EXISTS
 (SELECT 1 FROM receipt_reversals rv WHERE rv."receiptId" = rc.id AND rv."firmId" = rc."firmId")) s ON TRUE
 WHERE r."firmId" = ${scope.firmId} AND ${scope.employeeId === undefined ? Prisma.sql`TRUE` : assigned}
 )`;
}

export function getReceivableFilter(search: ReceivableSearch) {
	const clauses: Prisma.Sql[] = [Prisma.sql`TRUE`];
	if (search.query) {
		const pattern = `%${search.query.replace(/[\\%_]/g, "\\$&")}%`;
		clauses.push(
			Prisma.sql`("debtorName" ILIKE ${pattern} OR notes ILIKE ${pattern} OR "processNumber" ILIKE ${pattern})`,
		);
	}
	if (search.debtorId) {
		clauses.push(Prisma.sql`"debtorId" = ${search.debtorId}`);
	}
	if (search.contractId) {
		clauses.push(Prisma.sql`"contractId" = ${search.contractId}`);
	}
	if (search.origin === "contract") {
		clauses.push(Prisma.sql`"contractId" IS NOT NULL`);
	}
	if (search.origin === "direct") {
		clauses.push(Prisma.sql`"contractId" IS NULL`);
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

export async function getReceivables(
	session: LoggedUserSession,
	search: ReceivableSearch,
): Promise<ReceivablePage> {
	const columns = {
		dueDate: Prisma.sql`"dueDate"`,
		debtorName: Prisma.sql`"debtorName"`,
		amount: Prisma.sql`amount`,
	};
	const direction =
		search.direction === "desc" ? Prisma.sql`DESC` : Prisma.sql`ASC`;
	const [result] = await prisma.$queryRaw<
		Array<{ payload: unknown }>
	>(Prisma.sql`${getReceivableBase(session)}, filtered AS (SELECT * FROM base WHERE ${getReceivableFilter(search)}),
 page AS (SELECT * FROM filtered ORDER BY ${columns[search.column as keyof typeof columns] ?? columns.dueDate} ${direction}, id ASC LIMIT ${search.limit} OFFSET ${(search.page - 1) * search.limit})
 SELECT json_build_object('data', COALESCE((SELECT json_agg(page) FROM page), '[]'::json), 'total', COUNT(*),
 'totals', json_build_object('amount', COALESCE(SUM(amount) FILTER (WHERE situation <> 'cancelled'), 0),
 'principalAbated', COALESCE(SUM("principalAbated") FILTER (WHERE situation <> 'cancelled'), 0),
 'balance', COALESCE(SUM(balance), 0), 'overdue', COALESCE(SUM(balance) FILTER (WHERE situation = 'overdue'), 0),
 'cancelled', COALESCE(SUM(amount) FILTER (WHERE situation = 'cancelled'), 0))) AS payload FROM filtered`);
	return receivablePageSchema.parse(result.payload);
}

export async function getReceivableById(
	session: LoggedUserSession,
	id: number,
): Promise<ReceivableSummary> {
	const [result] = await prisma.$queryRaw<Array<{ payload: unknown }>>(
		Prisma.sql`${getReceivableBase(session)} SELECT row_to_json(base) AS payload FROM base WHERE id = ${id}`,
	);
	if (!result) {
		throw new Error(RECEIVABLE_ERRORS.DETAIL_FAILED);
	}
	return receivableSummarySchema.parse(result.payload);
}

export async function getReceivableOptions(
	session: LoggedUserSession,
): Promise<ReceivableOptions> {
	const [result] = await prisma.$queryRaw<
		Array<{ payload: unknown }>
	>(Prisma.sql`${getReceivableBase(session)}
 SELECT json_build_object(
 'debtors', COALESCE((SELECT json_agg(o ORDER BY label) FROM (SELECT DISTINCT "debtorId" AS id, "debtorId"::text AS value, "debtorName" AS label, TRUE AS "isActive" FROM base) o), '[]'::json),
 'contracts', COALESCE((SELECT json_agg(o ORDER BY label) FROM (SELECT DISTINCT "contractId" AS id, "contractId"::text AS value, COALESCE("processNumber", '#' || "contractId"::text) AS label, TRUE AS "isActive" FROM base WHERE "contractId" IS NOT NULL) o), '[]'::json),
 'analytics', COALESCE((SELECT json_agg(o ORDER BY label) FROM (SELECT DISTINCT "analyticId" AS id, "analyticValue" AS value, analytic AS label, TRUE AS "isActive" FROM base) o), '[]'::json),
 'methods', COALESCE((SELECT json_agg(o ORDER BY label) FROM (SELECT DISTINCT "methodId" AS id, "expectedMethodValue" AS value, "expectedMethod" AS label, TRUE AS "isActive" FROM base) o), '[]'::json)) AS payload`);
	return receivableOptionsSchema.parse(result.payload);
}

export async function getReceivableReceipts(
	session: LoggedUserSession,
	id: number,
): Promise<ReceivableReceipt[]> {
	await getReceivableById(session, id);
	const receipts = await prisma.receipt.findMany({
		where: { firmId: session.firm.id, receivableId: id },
		include: { actualPaymentMethod: true, reversal: true },
		orderBy: [{ effectiveDate: "desc" }, { id: "desc" }],
	});
	return receivableReceiptSchema.array().parse(
		receipts.map((row) => ({
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
