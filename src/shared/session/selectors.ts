import type { ClerkPermission } from "./catalog";
import type { LoggedUserSession } from "./types";

export function getCurrentFirmId(session: LoggedUserSession) {
	return session.firm.id;
}

export function getCurrentEmployeeId(session: LoggedUserSession) {
	if (session.employee.id === null) {
		throw new Error("Conta sem colaborador vinculado para esta operação.");
	}
	return session.employee.id;
}

export function hasPermission(
	session: Pick<LoggedUserSession, "permissions"> | null | undefined,
	permission: ClerkPermission,
) {
	return session?.permissions.includes(permission) ?? false;
}
