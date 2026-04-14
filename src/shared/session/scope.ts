import type {
	LoggedUserSession,
	SessionScope,
	SessionScopeSubject,
} from "./model";
import {
	getCurrentEmployeeId,
	getCurrentFirmId,
	isAdminSession,
} from "./selectors";

export function getScope(
	session: LoggedUserSession,
	subject: SessionScopeSubject,
): SessionScope {
	switch (subject) {
		case "attachment":
		case "audit-log":
		case "client":
		case "dashboard":
		case "employee":
			return { firmId: getCurrentFirmId(session) };
		case "contract":
		case "fee":
		case "remuneration":
			if (isAdminSession(session)) {
				return { firmId: getCurrentFirmId(session) };
			}

			return {
				firmId: getCurrentFirmId(session),
				employeeId: getCurrentEmployeeId(session),
			};
	}
}

export function getEmployeeScope(session: LoggedUserSession) {
	return getScope(session, "employee");
}

export function getContractScope(session: LoggedUserSession) {
	return getScope(session, "contract");
}

export function getFeeScope(session: LoggedUserSession) {
	return getScope(session, "fee");
}

export function getRemunerationScope(session: LoggedUserSession) {
	return getScope(session, "remuneration");
}
