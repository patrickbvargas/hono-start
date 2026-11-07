import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { seedExpenseGeneration } from "./seed-expense-generation.js";

const connectionString = process.env.DIRECT_URL;
if (!connectionString) {
	throw new Error("DIRECT_URL é obrigatória");
}
const target = new URL(connectionString);
const prisma = new PrismaClient({
	adapter: new PrismaPg(
		{ connectionString },
		{ schema: target.searchParams.get("schema") ?? "public" },
	),
});
try {
	const expenses = await prisma.$transaction(
		async (tx) => {
			await tx.$executeRaw`SELECT pg_advisory_xact_lock(20261030, 1)`;
			return seedExpenseGeneration(tx);
		},
		{ timeout: 30000 },
	);
	for (const expense of expenses) {
		console.log(JSON.stringify(expense));
	}
} finally {
	await prisma.$disconnect();
}
