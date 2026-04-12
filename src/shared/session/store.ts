import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";
import { cloneLoggedUserSession, createMockLoggedUserSession } from "./mock";
import type { LoggedUserSession } from "./model";

interface LoggedUserSessionState {
	session: LoggedUserSession;
	setSession: (session: LoggedUserSession) => void;
	resetSession: () => void;
}

const loggedUserSessionStore = createStore<LoggedUserSessionState>()((set) => ({
	session: createMockLoggedUserSession(),
	setSession: (session) => {
		set({ session: cloneLoggedUserSession(session) });
	},
	resetSession: () => {
		set({ session: createMockLoggedUserSession() });
	},
}));

export function getLoggedUserSession() {
	return cloneLoggedUserSession(loggedUserSessionStore.getState().session);
}

export function setLoggedUserSession(session: LoggedUserSession) {
	loggedUserSessionStore.getState().setSession(session);
}

export function resetLoggedUserSession() {
	loggedUserSessionStore.getState().resetSession();
}

export function useLoggedUserSessionStore<T>(
	selector: (session: LoggedUserSession) => T,
) {
	return useStore(loggedUserSessionStore, (state) => selector(state.session));
}
