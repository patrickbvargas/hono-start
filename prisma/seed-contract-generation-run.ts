import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { seedContractGeneration } from "./seed-contract-generation.js";

const connectionString = process.env.DIRECT_URL;
if (!connectionString) { throw new Error("DIRECT_URL é obrigatória"); }
const target = new URL(connectionString);
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }, { schema: target.searchParams.get("schema") ?? "public" }) });
try {
	const contracts = await prisma.$transaction(async (tx) => {
		await tx.$executeRaw`SELECT pg_advisory_xact_lock(20261030, 1)`;
		return seedContractGeneration(tx);
	}, { timeout: 30000 });
	for (const contract of contracts) {
		console.log(JSON.stringify(contract));
	}
} finally { await prisma.$disconnect(); }
