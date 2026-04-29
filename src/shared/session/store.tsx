import { createContext, useContext } from "react";
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

	if (session) {
		return session;
	}

	throw new Error("Sessão autenticada indisponível.");
}

export function useLoggedUserSessionStore<T>(
	selector: (session: LoggedUserSession) => T,
) {
	return selector(useLoggedUserSession());
}
