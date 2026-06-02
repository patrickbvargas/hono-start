import { env } from "@/shared/config/env";

export const AUTH_DEFAULT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;
export const AUTH_REMEMBERED_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const SUPABASE_AUTH_STORAGE_KEY = "hono-auth-token";
export const SUPABASE_REMEMBER_ME_COOKIE_NAME = "hono-remember-me";

function getRequiredEnvValue(
	value: string | undefined,
	name:
		| "SUPABASE_URL"
		| "SUPABASE_PUBLISHABLE_KEY"
		| "SUPABASE_SERVICE_ROLE_KEY",
) {
	if (!value) {
		throw new Error(`Variável de ambiente ${name} não configurada.`);
	}

	return value;
}

export function getSupabaseUrl() {
	return getRequiredEnvValue(env.SUPABASE_URL, "SUPABASE_URL");
}

export function getSupabasePublishableKey() {
	return getRequiredEnvValue(
		env.SUPABASE_PUBLISHABLE_KEY,
		"SUPABASE_PUBLISHABLE_KEY",
	);
}

export function getSupabaseServiceRoleKey() {
	return getRequiredEnvValue(
		env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_STORAGE_SERVICE_KEY,
		"SUPABASE_SERVICE_ROLE_KEY",
	);
}

export function getAuthCookieMaxAge(rememberMe: boolean) {
	return rememberMe
		? AUTH_REMEMBERED_SESSION_MAX_AGE_SECONDS
		: AUTH_DEFAULT_SESSION_MAX_AGE_SECONDS;
}

export function isProductionEnvironment() {
	return process.env.NODE_ENV === "production";
}
