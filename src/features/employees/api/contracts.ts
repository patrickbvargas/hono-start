import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";

async function hasContractEmployeesTable() {
	const [result] = await prisma.$queryRaw<Array<{ tableName: string | null }>>`
		SELECT to_regclass('public.contract_employees')::text AS "tableName"
	`;

	return !!result?.tableName;
}

export async function getActiveContractCountByEmployeeIds(
	employeeIds: number[],
) {
	if (employeeIds.length === 0 || !(await hasContractEmployeesTable())) {
		return new Map<number, number>();
	}

	const rows = await prisma.$queryRaw<
		Array<{ employeeId: number; total: number }>
	>(Prisma.sql`
		SELECT
			"employeeId" AS "employeeId",
			COUNT(DISTINCT "contractId")::int AS "total"
		FROM "contract_employees"
		WHERE "employeeId" IN (${Prisma.join(employeeIds)})
			AND "deletedAt" IS NULL
			AND "isActive" = true
		GROUP BY "employeeId"
	`);

	return new Map(rows.map((row) => [row.employeeId, Number(row.total)]));
}
