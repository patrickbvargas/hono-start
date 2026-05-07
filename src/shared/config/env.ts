import * as z from "zod";

const envSchema = z.object({
	AUTH_SECRET: z
		.string()
		.trim()
		.min(32, "AUTH_SECRET deve ter ao menos 32 caracteres"),
	BETTER_AUTH_SECRET: z
		.string()
		.trim()
		.min(32, "BETTER_AUTH_SECRET deve ter ao menos 32 caracteres"),
	BETTER_AUTH_URL: z.url("BETTER_AUTH_URL inválida"),
	DATABASE_URL: z.url("DATABASE_URL é obrigatória"),
	DIRECT_URL: z.url("DIRECT_URL é obrigatória"),
	RESEND_API_KEY: z.string().trim().min(1).optional(),
	RESEND_FROM_EMAIL: z.email("RESEND_FROM_EMAIL inválido").optional(),
	RESEND_FROM_NAME: z.string().trim().min(1).default("Hono"),
	SUPABASE_STORAGE_BUCKET: z.string().trim().min(1).default("attachments"),
	SUPABASE_STORAGE_SERVICE_KEY: z.string().trim().min(1).optional(),
	SUPABASE_URL: z.url("SUPABASE_URL inválida").optional(),
});

export const env = envSchema.parse(process.env);
