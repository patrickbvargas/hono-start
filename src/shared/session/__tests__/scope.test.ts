import { describe, expect, it } from "vitest";
import { getScope, type LoggedUserSession } from "@/shared/session";

function createSession(
	overrides: Partial<LoggedUserSession> = {},
): LoggedUserSession {
	return {
		permissions: [],
		clerk: {
			userId: "user_test",
			organizationId: "org_test",
			sessionId: "sess_test",
		},
		user: {
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
		...overrides,
	};
}

describe("session scope", () => {
	it("never widens a scoped read when the account has no employee binding", () => {
		const session = createSession({ employee: { id: null } });
		expect(() => getScope(session, "contract")).toThrow(
			"Conta sem colaborador",
		);
		expect(() => getScope(session, "fee")).toThrow("Conta sem colaborador");
		expect(() => getScope(session, "remuneration")).toThrow(
			"Conta sem colaborador",
		);
	});
	it("allows a general grant without an employee binding", () => {
		const session = createSession({
			employee: { id: null },
			permissions: ["org:contracts:read_all"],
		});
		expect(getScope(session, "contract")).toEqual({ firmId: 100 });
	});
	it("uses the authenticated firm for globally firm-scoped subjects", () => {
		const session = createSession({
			firm: { id: 200, name: "Filial" },
		});

		expect(getScope(session, "client")).toEqual({ firmId: 200 });
		expect(getScope(session, "employee")).toEqual({ firmId: 200 });
		expect(getScope(session, "audit-log")).toEqual({ firmId: 200 });
	});

	it("keeps explicitly granted all-scopes firm-scoped for contract, fee, and remuneration subjects", () => {
		const session = createSession({
			permissions: [
				"org:contracts:read_all",
				"org:fees:read_all",
				"org:remunerations:read_all",
			],
		});

		expect(getScope(session, "contract")).toEqual({ firmId: 100 });
		expect(getScope(session, "fee")).toEqual({ firmId: 100 });
		expect(getScope(session, "remuneration")).toEqual({ firmId: 100 });
	});

	it("adds authenticated employee scope for regular users on assigned-resource subjects", () => {
		const session = createSession({});

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
