import * as z from "zod";

const envSchema = z.object({
	DATABASE_URL: z.url("DATABASE_URL é obrigatória"),
	DIRECT_URL: z.url("DIRECT_URL é obrigatória"),
	RESEND_API_KEY: z.string().trim().min(1).optional(),
	RESEND_FROM_EMAIL: z.email("RESEND_FROM_EMAIL inválido").optional(),
	RESEND_FROM_NAME: z.string().trim().min(1).default("Hono"),
	SUPABASE_PUBLISHABLE_KEY: z.string().trim().min(1).optional(),
	SUPABASE_SERVICE_ROLE_KEY: z.string().trim().min(1).optional(),
	SUPABASE_STORAGE_BUCKET: z.string().trim().min(1).default("attachments"),
	SUPABASE_STORAGE_SERVICE_KEY: z.string().trim().min(1).optional(),
	SUPABASE_URL: z.url("SUPABASE_URL inválida").optional(),
});

export const env = envSchema.parse(process.env);
