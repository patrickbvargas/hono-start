import { useSyncExternalStore } from "react";
import { cloneLoggedUserSession, createMockLoggedUserSession } from "./mock";
import type { LoggedUserSession } from "./model";

let currentSession = createMockLoggedUserSession();
const listeners = new Set<() => void>();

function emitChange() {
	for (const listener of listeners) {
		listener();
	}
}

function subscribe(listener: () => void) {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
}

function getSnapshot() {
	return currentSession;
}

export function getLoggedUserSession() {
	return cloneLoggedUserSession(currentSession);
}

export function setLoggedUserSession(session: LoggedUserSession) {
	currentSession = cloneLoggedUserSession(session);
	emitChange();
}

export function resetLoggedUserSession() {
	currentSession = createMockLoggedUserSession();
	emitChange();
}

export function useLoggedUserSessionStore<T>(
	selector: (session: LoggedUserSession) => T,
) {
	return useSyncExternalStore(subscribe, () => selector(getSnapshot()));
}
