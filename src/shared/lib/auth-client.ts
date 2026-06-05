import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
	getSupabasePublishableKey,
	getSupabaseUrl,
	SUPABASE_AUTH_STORAGE_KEY,
} from "./auth";

let authClient: SupabaseClient | null = null;

export function getAuthClient() {
	if (authClient) {
		return authClient;
	}

	authClient = createBrowserClient(
		getSupabaseUrl(),
		getSupabasePublishableKey(),
		{
			auth: {
				storageKey: SUPABASE_AUTH_STORAGE_KEY,
			},
		},
	);

	return authClient;
}
