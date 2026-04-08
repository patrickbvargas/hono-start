// WORKS!!!
// import "dotenv/config";
// import { createRequire } from "node:module";
// import { PrismaPg } from "@prisma/adapter-pg";
// import type { PrismaClient as PrismaClientType } from "../../../generated/prisma";

// // The generated Prisma client uses CommonJS. We load it via createRequire so
// // that Node.js handles CJS evaluation natively, bypassing Vite's ESM module
// // runner which cannot evaluate CJS files.
// const _require = createRequire(import.meta.url);
// // biome-ignore lint/suspicious/noExplicitAny: CJS/ESM interop for Prisma generated client
// const { PrismaClient } = _require("../../../generated/prisma") as {
// 	PrismaClient: new (...args: unknown[]) => PrismaClientType;
// };

// const connectionString = `${process.env.DATABASE_URL}`;

// const adapter = new PrismaPg({ connectionString });
// const prisma = new PrismaClient({ adapter });

// export { prisma };

// DONT WORK!! (official Prisma 7 Tanstack Start setup)
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../generated/prisma/client";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL!,
});

declare global {
	var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
	globalThis.__prisma = prisma;
}
