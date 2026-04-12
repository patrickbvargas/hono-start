import type { LoggedUserSession } from "./model";
import { SESSION_ADMIN_ROLE_VALUE } from "./model";

const MOCK_LOGGED_USER_SESSION_SEED: LoggedUserSession = {
	user: {
		id: 1,
		fullName: "Amanda Admin",
		email: "amanda.admin@matriz.test",
	},
	employee: {
		id: 1,
	},
	firm: {
		id: 1,
		name: "Matriz",
	},
	employeeType: {
		id: 1,
		value: "LAWYER",
		label: "Advogado",
	},
	role: {
		id: 1,
		value: SESSION_ADMIN_ROLE_VALUE,
		label: "Administrador",
	},
};

export function cloneLoggedUserSession(
	session: LoggedUserSession,
): LoggedUserSession {
	return {
		user: { ...session.user },
		employee: { ...session.employee },
		firm: { ...session.firm },
		employeeType: { ...session.employeeType },
		role: { ...session.role },
	};
}

export function createMockLoggedUserSession(): LoggedUserSession {
	return cloneLoggedUserSession(MOCK_LOGGED_USER_SESSION_SEED);
}

export const MOCK_LOGGED_USER_SESSION = createMockLoggedUserSession();
