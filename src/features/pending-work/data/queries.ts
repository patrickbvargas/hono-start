import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { type PendingWorkPage, pendingWorkPageSchema } from "../schemas/model";
import type { PendingWorkSearch } from "../schemas/search";

interface PendingWorkScope {
	firmId: number;
	employeeId?: number;
	employeeTypeValue?: string;
	allContracts: boolean;
	allTitles: boolean;
	assignedTitles: boolean;
}
interface GetPendingWorkOptions {
	scope: PendingWorkScope;
	search: PendingWorkSearch;
	today?: string;
}
function assignmentAccess(scope: PendingWorkScope) {
	const types =
		scope.employeeTypeValue === "LAWYER"
			? ["RESPONSIBLE", "RECOMMENDED"]
			: scope.employeeTypeValue === "ADMIN_ASSISTANT"
				? ["ADMIN_ASSISTANT"]
				: [""];
	return Prisma.sql`EXISTS(SELECT 1 FROM contract_assignments ca JOIN ref_assignment_types at ON at.id=ca."assignmentTypeId"
 JOIN employee_profiles ep ON ep.id=ca."employeeProfileId" JOIN ref_employee_types et ON et.id=ep."employeeTypeId"
 WHERE ca."contractId"=c.id AND ca."firmId"=${scope.firmId} AND ca."employeeProfileId"=${scope.employeeId ?? -1}
 AND ca."isActive" AND ca."deletedAt" IS NULL AND at.value IN (${Prisma.join(types)}) AND et.value=${scope.employeeTypeValue ?? ""})`;
}
export async function getPendingWork({
	scope,
	search,
	today,
}: GetPendingWorkOptions): Promise<PendingWorkPage> {
	const assigned = assignmentAccess(scope);
	const visible = scope.allContracts ? Prisma.sql`TRUE` : assigned;
	const financial = scope.allTitles
		? Prisma.sql`TRUE`
		: scope.assignedTitles
			? assigned
			: Prisma.sql`FALSE`;
	const day = today
		? Prisma.sql`${today}::date`
		: Prisma.sql`(CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date`;
	const columns: Partial<Record<PendingWorkSearch["column"], Prisma.Sql>> = {
		clientId: Prisma.sql`"clientId"`,
		severity: Prisma.sql`CASE severity WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END`,
		title: Prisma.sql`title`,
		processNumber: Prisma.sql`"processNumber"`,
		client: Prisma.sql`client`,
		dueDate: Prisma.sql`"dueDate"`,
		remainingAmount: Prisma.sql`"remainingAmount"`,
	};
	const direction =
		search.direction === "desc" ? Prisma.sql`DESC` : Prisma.sql`ASC`;
	const orderBy = Prisma.sql`${columns[search.column] ?? Prisma.sql`id`} ${direction} NULLS LAST, "contractId", id`;
	const rows = await prisma.$queryRaw<Array<{ result: unknown }>>(Prisma.sql`
 WITH visible AS (
 SELECT c.id,c."processNumber",c."customerId" AS "clientId",p."fullName" AS client,c."isActive",s.value AS status,(${financial}) AS financial
 FROM contracts c JOIN client_profiles cp ON cp.id=c."customerId" JOIN people p ON p.id=cp."personId" JOIN ref_contract_statuses s ON s.id=c."statusId"
 WHERE c."firmId"=${scope.firmId} AND c."deletedAt" IS NULL AND (${visible})
 AND (${search.query}='' OR strpos(lower(c."processNumber"),lower(${search.query}))>0 OR strpos(lower(p."fullName"),lower(${search.query}))>0)
 AND (${search.clientId}='' OR c."customerId"::text=${search.clientId})
 AND (${search.employeeId}='' OR EXISTS(SELECT 1 FROM contract_assignments ca WHERE ca."contractId"=c.id AND ca."firmId"=${scope.firmId}
 AND ca."isActive" AND ca."deletedAt" IS NULL AND ca."employeeProfileId"::text=${search.employeeId}))
 ), titles AS (
 SELECT b."contractId",r."dueDate",GREATEST(r.amount-COALESCE(a.principal,0),0) AS balance
 FROM contract_revenue_receivables b JOIN visible c ON c.id=b."contractId" AND c.financial
 JOIN receivables r ON r.id=b."receivableId" AND r."firmId"=b."firmId"
 LEFT JOIN LATERAL(SELECT sum(rc."principalAbated") AS principal FROM receipts rc WHERE rc."receivableId"=r.id AND rc."firmId"=r."firmId"
 AND NOT EXISTS(SELECT 1 FROM receipt_reversals rv WHERE rv."receiptId"=rc.id AND rv."firmId"=rc."firmId")) a ON TRUE
 WHERE b."firmId"=${scope.firmId} AND r."cancelledAt" IS NULL
 ), balances AS (
 SELECT "contractId",sum(balance) AS remaining,min("dueDate") FILTER(WHERE balance>0) AS due,
 sum(balance) FILTER(WHERE balance>0 AND "dueDate"<${day}) AS overdue FROM titles GROUP BY "contractId"
 ), issues AS (
 SELECT 'titles-'||c.id AS id,c.id AS "contractId",c."processNumber",c."clientId",c.client,
 CASE WHEN b.due<${day} THEN 'Títulos em atraso' ELSE 'Títulos com vencimento próximo' END AS title,
 CASE WHEN b.due<${day} THEN 'high' ELSE 'medium' END AS severity,
 CASE WHEN b.due<${day} THEN 'overdue' ELSE 'upcoming' END AS type,
 to_char(b.due,'YYYY-MM-DD') AS "dueDate",CASE WHEN b.due<${day} THEN ${day}-b.due ELSE NULL END AS "overdueDays",
 NULLIF(b.overdue,0) AS "overdueAmount",b.remaining AS "remainingAmount",'finance' AS tab
 FROM visible c JOIN balances b ON b."contractId"=c.id WHERE b.remaining>0
 AND (b.due<${day} OR (c."isActive" AND c.status='ACTIVE' AND b.due BETWEEN ${day} AND ${day}+7))
 UNION ALL
 SELECT 'ungenerated-'||r.id,c.id,c."processNumber",c."clientId",c.client,rt.label||': gerar títulos','medium','remaining-balance',NULL,NULL::integer,NULL::numeric,r."negotiatedAmount",'finance'
 FROM revenues r JOIN visible c ON c.id=r."contractId" AND c.financial JOIN ref_revenue_types rt ON rt.id=r."revenueTypeId"
 WHERE r."firmId"=${scope.firmId} AND r."isActive" AND r."deletedAt" IS NULL AND c."isActive" AND c.status='ACTIVE'
 AND NOT EXISTS(SELECT 1 FROM contract_revenue_receivables b WHERE b."revenueId"=r.id AND b."firmId"=r."firmId")
 UNION ALL
 SELECT 'settled-'||c.id,c.id,c."processNumber",c."clientId",c.client,'Contrato quitado: revisar andamento','low','settled-active',NULL,NULL::integer,NULL::numeric,NULL::numeric,'finance'
 FROM visible c JOIN balances b ON b."contractId"=c.id WHERE c.financial AND c."isActive" AND c.status='ACTIVE' AND b.remaining=0
 AND NOT EXISTS(SELECT 1 FROM revenues r WHERE r."contractId"=c.id AND r."firmId"=${scope.firmId} AND r."isActive" AND r."deletedAt" IS NULL
 AND NOT EXISTS(SELECT 1 FROM contract_revenue_receivables b WHERE b."revenueId"=r.id AND b."firmId"=r."firmId"))
 ), filtered AS (
 SELECT * FROM issues WHERE ${search.severity.length ? Prisma.sql`severity IN (${Prisma.join(search.severity)})` : Prisma.sql`TRUE`}
 AND ${search.type.length ? Prisma.sql`type IN (${Prisma.join(search.type)})` : Prisma.sql`TRUE`}
 ), page AS (SELECT * FROM filtered ORDER BY ${orderBy} LIMIT ${search.limit} OFFSET ${(search.page - 1) * search.limit})
 SELECT jsonb_build_object('data',COALESCE((SELECT jsonb_agg(to_jsonb(p) ORDER BY ${orderBy}) FROM page p),'[]'::jsonb),
 'total',count(*),'high',count(*) FILTER(WHERE severity='high'),'medium',count(*) FILTER(WHERE severity='medium'),'low',count(*) FILTER(WHERE severity='low'),
 'contracts',count(DISTINCT "contractId"),'page',${search.page}::int,'pageSize',${search.limit}::int) AS result FROM filtered`);
	return pendingWorkPageSchema.parse(rows[0]?.result);
}
