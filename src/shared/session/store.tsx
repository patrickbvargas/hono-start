import { useQuery } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import { getCurrentSessionQueryOptions } from "./api";
import type { LoggedUserSession } from "./model";

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
	const fallbackSessionQuery = useQuery({
		...getCurrentSessionQueryOptions(),
		enabled: session === null,
	});

	if (session) {
		return session;
	}

	// Fallback to cached required-session query so authenticated consumers do not
	// crash if they render outside the provider boundary during route composition.
	if (fallbackSessionQuery.data) {
		return fallbackSessionQuery.data;
	}

	throw new Error("Sessão autenticada indisponível.");
}

export function useLoggedUserSessionStore<T>(
	selector: (session: LoggedUserSession) => T,
) {
	return selector(useLoggedUserSession());
}
