import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { type PendingWorkPage, pendingWorkPageSchema } from "../schemas/model";
import type { PendingWorkSearch } from "../schemas/search";

interface PendingWorkScope {
	firmId: number;
	employeeId?: number;
	employeeTypeValue?: string;
	allContracts: boolean;
	allFees: boolean;
	assignedFees: boolean;
}

interface GetPendingWorkOptions {
	scope: PendingWorkScope;
	search: PendingWorkSearch;
	today?: string;
}

// Same assignment visibility as contract and receipt reads; recommendation alone grants no access.
function assignmentAccess(scope: PendingWorkScope) {
	const types =
		scope.employeeTypeValue === "ADMIN_ASSISTANT"
			? ["ADMIN_ASSISTANT"]
			: ["RESPONSIBLE", "RECOMMENDED"];
	return Prisma.sql`EXISTS (
		SELECT 1 FROM contract_employees a JOIN assignment_types t ON t.id = a."assignmentTypeId"
		WHERE a."contractId" = c.id AND a."firmId" = ${scope.firmId}
		AND a."employeeId" = ${scope.employeeId ?? -1} AND a."isActive" AND a."deletedAt" IS NULL
		AND t.value IN (${Prisma.join(types)})
	)`;
}

export async function getPendingWork({
	scope,
	search,
	today,
}: GetPendingWorkOptions): Promise<PendingWorkPage> {
	const visible = scope.allContracts
		? Prisma.sql`TRUE`
		: assignmentAccess(scope);
	const financial = scope.allFees
		? Prisma.sql`TRUE`
		: scope.assignedFees
			? assignmentAccess(scope)
			: Prisma.sql`FALSE`;
	const referenceDay = today
		? Prisma.sql`${today}::date`
		: Prisma.sql`(CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date`;
	const columns: Record<string, Prisma.Sql> = {
		severity: Prisma.sql`CASE severity WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END`,
		title: Prisma.sql`title`,
		processNumber: Prisma.sql`"processNumber"`,
		client: Prisma.sql`client`,
		dueDate: Prisma.sql`"dueDate"`,
		remainingAmount: Prisma.sql`"remainingAmount"`,
	};
	const direction =
		search.direction === "desc" ? Prisma.sql`DESC` : Prisma.sql`ASC`;
	const orderBy = Prisma.sql`${columns[search.column]} ${direction} NULLS LAST, CASE severity WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END, "dueDate" ASC NULLS LAST, "contractId", id`;
	const rows = await prisma.$queryRaw<Array<{ result: unknown }>>(Prisma.sql`
		WITH visible AS (
			SELECT c.id, c."processNumber", c."clientId", cl."fullName" AS client,
				c."isActive", s.value AS status, (${financial}) AS financial
			FROM contracts c JOIN clients cl ON cl.id = c."clientId" AND cl."firmId" = c."firmId"
			JOIN contract_statuses s ON s.id = c."statusId"
			WHERE c."firmId" = ${scope.firmId} AND c."deletedAt" IS NULL AND (${visible})
			AND (${search.query} = '' OR strpos(lower(c."processNumber"), lower(${search.query})) > 0
				OR strpos(lower(cl."fullName"), lower(${search.query})) > 0)
			AND (${search.clientId} = '' OR c."clientId"::text = ${search.clientId})
			AND (${search.employeeId} = '' OR EXISTS (
				SELECT 1 FROM contract_employees a WHERE a."contractId" = c.id
				AND a."firmId" = ${scope.firmId} AND a."isActive" AND a."deletedAt" IS NULL
				AND a."employeeId"::text = ${search.employeeId}
			))
		), payment_plans AS (
 SELECT r.*, rt.label, r."totalValue" - COALESCE(r."downPaymentValue", 0) AS principal,
  round((r."totalValue" - COALESCE(r."downPaymentValue", 0)) / r."totalInstallments", 2) AS regular,
  GREATEST(r."totalValue" - COALESCE(r."downPaymentValue", 0) - COALESCE(f.paid,0), 0) AS remaining,
  COALESCE(f.recorded,0) AS recorded
 FROM revenues r JOIN visible c ON c.id = r."contractId" AND c.financial
 JOIN revenue_types rt ON rt.id = r."typeId"
 LEFT JOIN LATERAL (
  SELECT sum(amount) AS paid, count(DISTINCT "installmentNumber") FILTER (WHERE "installmentNumber" BETWEEN 1 AND r."totalInstallments") AS recorded
  FROM fees WHERE "revenueId" = r.id AND "firmId" = ${scope.firmId} AND "isActive" AND "deletedAt" IS NULL
 ) f ON TRUE
 WHERE r."firmId" = ${scope.firmId} AND r."isActive" AND r."deletedAt" IS NULL
), installments AS (
 SELECT r.id, (r."paymentStartDate"::date + make_interval(months => n.number))::date AS due,
  GREATEST((CASE WHEN n.number = r."totalInstallments" THEN r.principal - r.regular * (n.number - 1) ELSE r.regular END) - COALESCE((
   SELECT sum(f.amount) FROM fees f WHERE f."revenueId" = r.id AND f."installmentNumber" = n.number
   AND f."firmId" = ${scope.firmId} AND f."isActive" AND f."deletedAt" IS NULL
  ),0),0) AS outstanding
 FROM payment_plans r CROSS JOIN LATERAL generate_series(1,r."totalInstallments") AS n(number)
 WHERE r.remaining > 0
), next_due AS (
 SELECT id, min(due) AS due, COALESCE(sum(outstanding) FILTER (WHERE due < ${referenceDay}),0) AS overdue
 FROM installments WHERE outstanding > 0 GROUP BY id), issues AS (
 SELECT CASE WHEN r.recorded >= r."totalInstallments" THEN 'balance-' ELSE 'revenue-' END || r.id AS id,
  c.id AS "contractId", c."processNumber", c."clientId", c.client,
  r.label || CASE WHEN r.recorded >= r."totalInstallments" THEN ': saldo após a última parcela'
   WHEN d.due < ${referenceDay} THEN ': vencimento em atraso' ELSE ': vencimento próximo' END AS title,
  CASE WHEN r.recorded >= r."totalInstallments" OR d.due < ${referenceDay} THEN 'high' ELSE 'medium' END AS severity,
  CASE WHEN r.recorded >= r."totalInstallments" THEN 'remaining-balance' WHEN d.due < ${referenceDay} THEN 'overdue' ELSE 'upcoming' END AS type,
  to_char(d.due,'YYYY-MM-DD') AS "dueDate", 'finance' AS tab,
 CASE WHEN d.due < ${referenceDay} THEN ${referenceDay} - d.due ELSE NULL END AS "overdueDays",
 NULLIF(LEAST(COALESCE(d.overdue,0),r.remaining),0) AS "overdueAmount", r.remaining AS "remainingAmount"
 FROM payment_plans r JOIN visible c ON c.id = r."contractId" LEFT JOIN next_due d ON d.id = r.id
 WHERE r.remaining > 0 AND (r.recorded >= r."totalInstallments" OR d.due < ${referenceDay}
  OR (c."isActive" AND c.status = 'ACTIVE' AND d.due BETWEEN ${referenceDay} AND ${referenceDay} + 7))
 UNION ALL
 SELECT 'settled-' || c.id, c.id, c."processNumber", c."clientId", c.client,
  'Contrato quitado: revisar andamento', 'low', 'settled-active', NULL, 'finance', NULL::integer, NULL::numeric, NULL::numeric
 FROM visible c WHERE c.financial AND c."isActive" AND c.status = 'ACTIVE'
 AND EXISTS (SELECT 1 FROM payment_plans r WHERE r."contractId" = c.id)
 AND NOT EXISTS (SELECT 1 FROM payment_plans r WHERE r."contractId" = c.id AND r.remaining > 0)), filtered AS (
			SELECT * FROM issues WHERE ${search.severity.length === 0 ? Prisma.sql`TRUE` : Prisma.sql`severity IN (${Prisma.join(search.severity)})`}
			AND ${search.type.length === 0 ? Prisma.sql`TRUE` : Prisma.sql`type IN (${Prisma.join(search.type)})`}
		), page AS (
			SELECT * FROM filtered ORDER BY ${orderBy}
			LIMIT ${search.limit} OFFSET ${(search.page - 1) * search.limit}
		)
		SELECT jsonb_build_object(
			'data', COALESCE((SELECT jsonb_agg(to_jsonb(p) ORDER BY ${orderBy}) FROM page p), '[]'::jsonb),
			'total', count(*), 'high', count(*) FILTER (WHERE severity = 'high'),
			'medium', count(*) FILTER (WHERE severity = 'medium'), 'low', count(*) FILTER (WHERE severity = 'low'), 'contracts', count(DISTINCT "contractId"),
			'page', ${search.page}::int, 'pageSize', ${search.limit}::int
		) AS result FROM filtered
	`);
	return pendingWorkPageSchema.parse(rows[0]?.result);
}
