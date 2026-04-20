import { type LoggedUserSession, SESSION_ADMIN_ROLE_VALUE } from "./model";

export function isAdminSession(session: LoggedUserSession) {
	return session.role.value === SESSION_ADMIN_ROLE_VALUE;
}

export function getCurrentFirmId(session: LoggedUserSession) {
	return session.firm.id;
}

export function getCurrentEmployeeId(session: LoggedUserSession) {
	return session.employee.id;
}
