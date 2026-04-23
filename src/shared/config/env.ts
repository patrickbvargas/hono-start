import * as z from "zod";

const envSchema = z.object({
	DATABASE_URL: z.url("DATABASE_URL é obrigatória"),
	DIRECT_URL: z.url("DIRECT_URL é obrigatória"),
	SUPABASE_STORAGE_BUCKET: z.string().trim().min(1).default("attachments"),
	SUPABASE_STORAGE_SERVICE_KEY: z.string().trim().min(1).optional(),
	SUPABASE_URL: z.url("SUPABASE_URL inválida").optional(),
});

export const env = envSchema.parse(process.env);
