import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import {
	getCurrentSessionQueryOptions,
	getOptionalCurrentSessionQueryOptions,
} from "./api";

export async function requireRouteSession(queryClient: QueryClient) {
	try {
		return await queryClient.ensureQueryData(getCurrentSessionQueryOptions());
	} catch {
		throw redirect({
			to: "/login",
		});
	}
}

export async function getRouteSession(queryClient: QueryClient) {
	return queryClient.ensureQueryData(getOptionalCurrentSessionQueryOptions());
}
