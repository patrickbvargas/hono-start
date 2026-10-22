import * as z from "zod";

const envSchema = z.object({
	ATTACHMENTS_DIR: z
		.string()
		.trim()
		.min(1)
		.refine(
			(value) => /^(?:[A-Za-z]:[\\/]|\/|\\\\)/.test(value),
			"ATTACHMENTS_DIR deve ser absoluta",
		)
		.optional(),
	APP_URL: z.url().default("http://localhost:3000"),
	CLERK_SECRET_KEY: z.string().trim().startsWith("sk_").optional(),
	CLERK_WEBHOOK_SIGNING_SECRET: z
		.string()
		.trim()
		.startsWith("whsec_")
		.optional(),
	DATABASE_URL: z.url("DATABASE_URL é obrigatória"),
	DIRECT_URL: z.url("DIRECT_URL é obrigatória"),
});

export const env = envSchema.parse(process.env);
