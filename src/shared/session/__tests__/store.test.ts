import { beforeEach, describe, expect, it, vi } from "vitest";

const { useContextMock } = vi.hoisted(() => ({
	useContextMock: vi.fn(),
}));

vi.mock("react", () => ({
	createContext: vi.fn(() => ({})),
	useContext: useContextMock,
}));

import { useLoggedUserSession, useLoggedUserSessionStore } from "../store";

describe("shared session hooks", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns the authenticated actor from the session context", () => {
		useContextMock.mockReturnValue({
			user: {
				id: 7,
				fullName: "Carlos Mendes",
				email: "carlos@example.com",
			},
			employee: { id: 7 },
			firm: { id: 1, name: "Matriz" },
			employeeType: { id: 2, value: "LAWYER", label: "Advogado" },
			role: { id: 1, value: "ADMIN", label: "Administrador" },
		});

		expect(useLoggedUserSession()).toEqual(
			expect.objectContaining({
				user: expect.objectContaining({
					id: 7,
				}),
			}),
		);
	});

	it("throws a safe error when the session context is unavailable", () => {
		useContextMock.mockReturnValue(null);

		expect(() => useLoggedUserSession()).toThrowError(
			"Sessão autenticada indisponível.",
		);
	});

	it("applies selectors against the authenticated actor", () => {
		useContextMock.mockReturnValue({
			user: {
				id: 9,
				fullName: "Amanda Admin",
				email: "amanda@example.com",
			},
			employee: { id: 10 },
			firm: { id: 100, name: "Matriz" },
			employeeType: { id: 3, value: "LAWYER", label: "Advogado" },
			role: { id: 1, value: "ADMIN", label: "Administrador" },
		});

		const email = useLoggedUserSessionStore((session) => session.user.email);

		expect(email).toBe("amanda@example.com");
	});
});
