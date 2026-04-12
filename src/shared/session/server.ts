import type { SessionScopeSubject } from "./model";
import { getEmployeeScope, getScope } from "./scope";
import { getCurrentFirmId } from "./selectors";
import { getLoggedUserSession } from "./store";

export function getServerLoggedUserSession() {
	return getLoggedUserSession();
}

export function getServerScope(subject: SessionScopeSubject) {
	return getScope(getServerLoggedUserSession(), subject);
}

export function getServerEmployeeScope() {
	return getEmployeeScope(getServerLoggedUserSession());
}

export function getServerFirmId() {
	return getCurrentFirmId(getServerLoggedUserSession());
}
