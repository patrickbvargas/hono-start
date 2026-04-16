import * as z from "zod";

const envSchema = z.object({
	DATABASE_URL: z.url("DATABASE_URL é obrigatória"),
	DIRECT_URL: z.url("DIRECT_URL é obrigatória"),
});

export const env = envSchema.parse(process.env);
