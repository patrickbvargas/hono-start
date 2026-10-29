import * as z from "zod";

const envSchema = z.object({
	CLOUDFLARE_ACCOUNT_ID: z
		.string()
		.regex(/^[a-f0-9]{32}$/)
		.optional(),
	CLOUDFLARE_R2_BUCKET_NAME: z
		.string()
		.min(3)
		.max(63)
		.regex(/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/)
		.optional(),
	CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().trim().min(1).optional(),
	CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().trim().min(1).optional(),
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
