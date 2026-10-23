import { useAuth } from "@clerk/tanstack-react-start";
import {
	type QueryClient,
	queryOptions,
	useQueryClient,
} from "@tanstack/react-query";
import { redirect, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { LoggedUserSession } from "./schema";
import { getOptionalServerLoggedUserSession } from "./server";

export const sessionKeys = {
	all: ["session"] as const,
	current: () => [...sessionKeys.all, "current"] as const,
};

const getCurrentSessionFn = createServerFn({ method: "GET" }).handler(
	async () => {
		return getOptionalServerLoggedUserSession();
	},
);

export const getCurrentSessionQueryOptions = () =>
	queryOptions({
		queryKey: sessionKeys.current(),
		queryFn: getCurrentSessionFn,
		staleTime: 0,
	});

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

export async function requireRouteSession(
	queryClient: QueryClient,
	redirectPath?: string,
) {
	const safeRedirectPath = getSafeInternalRedirectPath(redirectPath);

	const session = await getRouteSession(queryClient).catch(() => null);
	if (session) {
		return session;
	}

	queryClient.setQueryData(sessionKeys.current(), null);
	throw redirect({
		to: "/login",
		search: safeRedirectPath ? { redirect: safeRedirectPath } : undefined,
	});
}

export async function getRouteSession(queryClient: QueryClient) {
	return queryClient.query(getCurrentSessionQueryOptions());
}

const LoggedUserSessionContext = createContext<LoggedUserSession | null>(null);

interface LoggedUserSessionProviderProps {
	children: React.ReactNode;
	session: LoggedUserSession;
}

export function LoggedUserSessionProvider({
	children,
	session,
}: LoggedUserSessionProviderProps) {
	return (
		<LoggedUserSessionContext.Provider value={session}>
			{children}
		</LoggedUserSessionContext.Provider>
	);
}

export function useLoggedUserSession() {
	const session = useContext(LoggedUserSessionContext);

	if (session) {
		return session;
	}

	throw new Error("Sessão autenticada indisponível.");
}

export function useOptionalLoggedUserSession() {
	return useContext(LoggedUserSessionContext);
}

interface ClerkSessionBoundaryProps {
	children: React.ReactNode;
}

export function ClerkSessionBoundary({ children }: ClerkSessionBoundaryProps) {
	const { isLoaded, userId, sessionId, orgId, sessionClaims } = useAuth();
	const queryClient = useQueryClient();
	const router = useRouter();
	const fingerprint = JSON.stringify([
		userId,
		sessionId,
		orgId,
		sessionClaims?.o,
	]);
	const previous = useRef(fingerprint);
	const [settled, setSettled] = useState(fingerprint);
	useEffect(() => {
		if (!isLoaded || previous.current === fingerprint) {
			return;
		}
		previous.current = fingerprint;
		let active = true;
		void (async () => {
			await queryClient.cancelQueries();
			queryClient.clear();
			await router.invalidate();
			if (active) {
				setSettled(fingerprint);
			}
		})();
		return () => {
			active = false;
		};
	}, [fingerprint, isLoaded, queryClient, router]);
	if (!isLoaded || settled !== fingerprint) {
		return null;
	}
	return children;
}
