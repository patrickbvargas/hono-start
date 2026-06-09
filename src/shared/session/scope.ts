import {
	getCurrentEmployeeId,
	getCurrentFirmId,
	isAdminSession,
} from "./selectors";
import type {
	LoggedUserSession,
	SessionScope,
	SessionScopeSubject,
} from "./types";

export function getScope(
	session: LoggedUserSession,
	subject: SessionScopeSubject,
): SessionScope {
	switch (subject) {
		case "attachment":
		case "audit-log":
		case "client":
		case "dashboard":
		case "expense":
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
