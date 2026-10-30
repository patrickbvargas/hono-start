import "dotenv/config";
import { readFile } from "node:fs/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import {
	seedFinancialAttachments,
	verifyFinancialSeed,
} from "./seed-financial-evidence.js";
import { SEED_MARKER } from "./seed-financial-fixtures.js";
import {
	completeFinancialFixtures,
	seedFinancialScenarios,
} from "./seed-financial-scenarios.js";

const connectionString = process.env.DIRECT_URL;
if (!connectionString) {
	throw new Error("DIRECT_URL é obrigatória");
}
const url = new URL(connectionString);
const prisma = new PrismaClient({
	adapter: new PrismaPg(
		{ connectionString },
		{ schema: url.searchParams.get("schema") ?? "public" },
	),
});
async function main() {
	const catalogs = JSON.parse(
		await readFile(new URL("./seed-catalogs.json", import.meta.url), "utf8"),
	) as Record<string, Array<{ value: string; label: string }>>;
	await prisma.$transaction(
		async (tx) => {
			await tx.$executeRaw`SELECT pg_advisory_xact_lock(20261030, 1)`;
			const existing = await tx.auditLog.findFirst({
				where: { entityType: "Seed", entityId: SEED_MARKER },
			});
			if (existing) {
				const companyType = await tx.personType.findUniqueOrThrow({
					where: { value: "COMPANY" },
				});
				await tx.person.upsert({
					where: { document: "11222333000181" },
					update: {},
					create: {
						fullName: "Empresa demonstrativa",
						document: "11222333000181",
						personTypeId: companyType.id,
						isCustomer: true,
						isSupplier: true,
					},
				});
				await completeFinancialFixtures(tx);
				console.log(
					"Seed existente: validando sem duplicar eventos financeiros.",
				);
				return;
			}
			if (await tx.person.count()) {
				throw new Error(
					"Banco contém pessoas sem marcador do seed. Use banco descartável vazio; nenhum dado foi removido.",
				);
			}
			const lookups: Record<string, Record<string, number>> = {};
			for (const [catalog, rows] of Object.entries(catalogs)) {
				lookups[catalog] = {};
				// Closed, checked catalog names; SQL identifiers never originate in user input.
				const tables: Record<string, string> = {
					personType: "ref_person_types",
					employeeType: "ref_employee_types",
					legalArea: "ref_legal_areas",
					contractStatus: "ref_contract_statuses",
					assignmentType: "ref_assignment_types",
					revenueType: "ref_revenue_types",
					attachmentType: "ref_attachment_types",
					financialAnalytic: "ref_financial_analytics",
					paymentMethod: "ref_payment_methods",
					titleKind: "ref_title_kinds",
				};
				const table = tables[catalog];
				if (!table) {
					throw new Error("Unknown seed catalog");
				}
				for (const row of rows) {
					const result = await tx.$queryRawUnsafe<Array<{ id: number }>>(
						`INSERT INTO "${table}" (value,label,"isActive") VALUES ($1,$2,true) ON CONFLICT(value) DO UPDATE SET label=EXCLUDED.label RETURNING id`,
						row.value,
						row.label,
					);
					lookups[catalog][row.value] = result[0].id;
				}
			}
			await seedFinancialScenarios(tx, lookups);
			await completeFinancialFixtures(tx);
		},
		{ timeout: 120000, maxWait: 15000 },
	);
	await verifyFinancialSeed(prisma);
	await seedFinancialAttachments(prisma);
	console.log("Seed financeiro persistido e validado.");
}
main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(() => prisma.$disconnect());
