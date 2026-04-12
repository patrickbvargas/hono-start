import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/shared/lib/prisma";

async function hasContractsTable() {
	const [result] = await prisma.$queryRaw<Array<{ tableName: string | null }>>`
		SELECT to_regclass('public.contracts')::text AS "tableName"
	`;

	return !!result?.tableName;
}

export async function getActiveContractCountByClientIds(clientIds: number[]) {
	if (clientIds.length === 0 || !(await hasContractsTable())) {
		return new Map<number, number>();
	}

	const rows = await prisma.$queryRaw<
		Array<{ clientId: number; total: number }>
	>(Prisma.sql`
		SELECT
			client_id AS "clientId",
			COUNT(*)::int AS "total"
		FROM "contracts"
		WHERE "client_id" IN (${Prisma.join(clientIds)})
			AND "deleted_at" IS NULL
		GROUP BY "client_id"
	`);

	return new Map(rows.map((row) => [row.clientId, Number(row.total)]));
}

export async function assertClientHasNoActiveContracts(clientId: number) {
	const counts = await getActiveContractCountByClientIds([clientId]);

	if ((counts.get(clientId) ?? 0) > 0) {
		throw new Error("Não é possível excluir um cliente com contratos ativos");
	}
}
