import "dotenv/config";
import { defineConfig } from "prisma/config";
import { env } from "./src/shared/config/env";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    path: "./prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env.DIRECT_URL, // Migrations use the direct connection; runtime uses DATABASE_URL.
  },
});
