import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { getCurrentSessionQueryOptions, sessionKeys } from "./api";

function clearCurrentSession(queryClient: QueryClient) {
	queryClient.setQueryData(sessionKeys.current(), null);
}

export async function requireRouteSession(queryClient: QueryClient) {
	try {
		const session = await queryClient.ensureQueryData(
			getCurrentSessionQueryOptions(),
		);

		if (session) {
			return session;
		}
	} catch {
		clearCurrentSession(queryClient);
		throw redirect({
			to: "/login",
		});
	}

	clearCurrentSession(queryClient);
	throw redirect({
		to: "/login",
	});
}

export async function getRouteSession(queryClient: QueryClient) {
	return queryClient.ensureQueryData(getCurrentSessionQueryOptions());
}
