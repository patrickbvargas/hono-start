import { describe, expect, it } from "vitest";
import {
	getScope,
	type LoggedUserSession,
	SESSION_ADMIN_ROLE_VALUE,
	SESSION_USER_ROLE_VALUE,
} from "@/shared/session";

function createSession(
	overrides: Partial<LoggedUserSession> = {},
): LoggedUserSession {
	return {
		user: {
			id: 1,
			fullName: "Amanda Admin",
			email: "amanda@example.com",
			...overrides.user,
		},
		employee: {
			id: 10,
			...overrides.employee,
		},
		firm: {
			id: 100,
			name: "Matriz",
			...overrides.firm,
		},
		employeeType: {
			id: 1,
			value: "LAWYER",
			label: "Advogado",
			...overrides.employeeType,
		},
		role: {
			id: 1,
			value: SESSION_ADMIN_ROLE_VALUE,
			label: "Administrador",
			...overrides.role,
		},
	};
}

describe("session scope", () => {
	it("uses the authenticated firm for globally firm-scoped subjects", () => {
		const session = createSession({
			firm: { id: 200, name: "Filial" },
		});

		expect(getScope(session, "client")).toEqual({ firmId: 200 });
		expect(getScope(session, "employee")).toEqual({ firmId: 200 });
		expect(getScope(session, "audit-log")).toEqual({ firmId: 200 });
	});

	it("keeps admins firm-scoped for contract, fee, and remuneration subjects", () => {
		const session = createSession();

		expect(getScope(session, "contract")).toEqual({ firmId: 100 });
		expect(getScope(session, "fee")).toEqual({ firmId: 100 });
		expect(getScope(session, "remuneration")).toEqual({ firmId: 100 });
	});

	it("adds authenticated employee scope for regular users on assigned-resource subjects", () => {
		const session = createSession({
			role: {
				id: 2,
				value: SESSION_USER_ROLE_VALUE,
				label: "Usuário",
			},
		});

		expect(getScope(session, "contract")).toEqual({
			firmId: 100,
			employeeId: 10,
		});
		expect(getScope(session, "fee")).toEqual({
			firmId: 100,
			employeeId: 10,
		});
		expect(getScope(session, "remuneration")).toEqual({
			firmId: 100,
			employeeId: 10,
		});
	});
});
