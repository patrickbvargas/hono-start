import {
	getCurrentEmployeeId,
	getCurrentFirmId,
	hasPermission,
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
			if (
				hasPermission(
					session,
					subject === "contract"
						? "org:contracts:read_all"
						: subject === "fee"
							? "org:fees:read_all"
							: "org:remunerations:read_all",
				)
			) {
				return { firmId: getCurrentFirmId(session) };
			}

			return {
				firmId: getCurrentFirmId(session),
				employeeId: getCurrentEmployeeId(session),
			};
	}
}
