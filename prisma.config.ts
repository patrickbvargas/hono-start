import "dotenv/config";
import { defineConfig } from "prisma/config";
import { env } from "./src/shared/lib/env";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    path: "./prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env.DIRECT_URL, // TODO: change to env.DATABASE_URL on production
  },
});
