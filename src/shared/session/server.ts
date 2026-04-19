import type { SessionScopeSubject } from "./model";
import { getScope } from "./scope";
import { getLoggedUserSession } from "./store";

export function getServerLoggedUserSession() {
	return getLoggedUserSession();
}

export function getServerScope(subject: SessionScopeSubject) {
	return getScope(getServerLoggedUserSession(), subject);
}
