import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { getCurrentSessionQueryOptions, sessionKeys } from "./api";
import type { LoggedUserSession } from "./model";

export const FORCED_PASSWORD_CHANGE_PATH =
	"/alterar-senha-obrigatoria" as const;

function clearCurrentSession(queryClient: QueryClient) {
	queryClient.setQueryData(sessionKeys.current(), null);
}

export function getSafeInternalRedirectPath(
	redirectPath: string | null | undefined,
) {
	if (!redirectPath) {
		return undefined;
	}

	if (!redirectPath.startsWith("/") || redirectPath.startsWith("//")) {
		return undefined;
	}

	if (
		redirectPath === "/login" ||
		redirectPath.startsWith("/login?") ||
		redirectPath === "/recuperar-senha" ||
		redirectPath.startsWith("/recuperar-senha?")
	) {
		return undefined;
	}

	return redirectPath;
}

export function getAuthenticatedHomePath(session: LoggedUserSession) {
	if (session.mustChangePassword) {
		return FORCED_PASSWORD_CHANGE_PATH;
	}

	return "/";
}

export async function requireRouteSession(
	queryClient: QueryClient,
	redirectPath?: string,
) {
	const safeRedirectPath = getSafeInternalRedirectPath(redirectPath);

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
			search: safeRedirectPath ? { redirect: safeRedirectPath } : undefined,
		});
	}

	clearCurrentSession(queryClient);
	throw redirect({
		to: "/login",
		search: safeRedirectPath ? { redirect: safeRedirectPath } : undefined,
	});
}

export async function getRouteSession(queryClient: QueryClient) {
	return queryClient.ensureQueryData(getCurrentSessionQueryOptions());
}
