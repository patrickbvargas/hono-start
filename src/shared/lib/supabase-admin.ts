import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/shared/lib/auth";

let supabaseAdminClient: SupabaseClient | null = null;

// Official access-control integration points for @supabase/auth-js 2.107.0:
// `auth.admin.updateUserById(..., { ban_duration })` controls ban/unban and
// `auth.admin.getUserById(...)` is the server-side source of truth for access state.
export const SUPABASE_AUTH_BAN_FOREVER = "876000h";

export type SupabaseCredentialAccessStatus =
	| "NOT_GRANTED"
	| "ACTIVE"
	| "REVOKED";

function getErrorCode(error: unknown) {
	if (!error || typeof error !== "object") {
		return null;
	}

	const code = "code" in error ? error.code : null;
	return typeof code === "string" ? code : null;
}

export function isSupabaseAuthUserMissingError(error: unknown) {
	return getErrorCode(error) === "user_not_found";
}

export function isSupabaseAuthUserBannedError(error: unknown) {
	return getErrorCode(error) === "user_banned";
}

export function isSupabaseAuthUserBanned(
	user: Pick<User, "banned_until"> | null | undefined,
) {
	if (!user?.banned_until) {
		return false;
	}

	const bannedUntilTimestamp = Date.parse(user.banned_until);

	return Number.isFinite(bannedUntilTimestamp)
		? bannedUntilTimestamp > Date.now()
		: false;
}

export async function getSupabaseCredentialAccessState(
	authUserId: string | null,
) {
	if (!authUserId) {
		return {
			hasCredentialAccount: false,
			isAccessActive: false,
			status: "NOT_GRANTED" as const,
			user: null,
		};
	}

	const admin = getSupabaseAdminClient();
	const { data, error } = await admin.auth.admin.getUserById(authUserId);

	if (error) {
		if (isSupabaseAuthUserMissingError(error)) {
			return {
				hasCredentialAccount: false,
				isAccessActive: false,
				status: "NOT_GRANTED" as const,
				user: null,
			};
		}

		throw error;
	}

	const user = data.user;
	const isAccessActive = !isSupabaseAuthUserBanned(user);

	return {
		hasCredentialAccount: true,
		isAccessActive,
		status: isAccessActive ? ("ACTIVE" as const) : ("REVOKED" as const),
		user,
	};
}

export function getSupabaseAdminClient() {
	if (supabaseAdminClient) {
		return supabaseAdminClient;
	}

	supabaseAdminClient = createClient(
		getSupabaseUrl(),
		getSupabaseServiceRoleKey(),
		{
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		},
	);

	return supabaseAdminClient;
}
