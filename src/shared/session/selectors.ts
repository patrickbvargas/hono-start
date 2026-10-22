import type { ClerkPermission } from "./catalog";
import type { LoggedUserSession } from "./types";

export function getCurrentFirmId(session: LoggedUserSession) {
	return session.firm.id;
}

export function getCurrentEmployeeId(session: LoggedUserSession) {
	return session.employee.id;
}

export function hasPermission(
	session: Pick<LoggedUserSession, "permissions"> | null | undefined,
	permission: ClerkPermission,
) {
	return session?.permissions.includes(permission) ?? false;
}
