import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/shared/lib/auth";

let supabaseAdminClient: SupabaseClient | null = null;

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
