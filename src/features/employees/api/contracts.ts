import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";

export async function getActiveContractCountByEmployeeIds(
	employeeIds: number[],
) {
	if (employeeIds.length === 0) {
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
