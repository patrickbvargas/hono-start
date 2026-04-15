import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { CLIENT_ERRORS } from "../constants/errors";

export async function getActiveContractCountByClientIds(clientIds: number[]) {
	if (clientIds.length === 0) {
		return new Map<number, number>();
	}

	const rows = await prisma.$queryRaw<
		Array<{ clientId: number; total: number }>
	>(Prisma.sql`
		SELECT
			"clientId" AS "clientId",
			COUNT(*)::int AS "total"
		FROM "contracts"
		WHERE "clientId" IN (${Prisma.join(clientIds)})
			AND "deletedAt" IS NULL
		GROUP BY "clientId"
	`);

	return new Map(rows.map((row) => [row.clientId, Number(row.total)]));
}

export async function assertClientHasNoActiveContracts(clientId: number) {
	const counts = await getActiveContractCountByClientIds([clientId]);

	if ((counts.get(clientId) ?? 0) > 0) {
		throw new Error(CLIENT_ERRORS.CLIENT_ALREADY_HAS_ACTIVE_CONTRACTS);
	}
}
