import { beforeEach, describe, expect, it, vi } from "vitest";

const { useContextMock } = vi.hoisted(() => ({
	useContextMock: vi.fn(),
}));

vi.mock("react", async (importOriginal) => ({
	...(await importOriginal<typeof import("react")>()),
	createContext: vi.fn(() => ({})),
	useContext: useContextMock,
}));

import { useLoggedUserSession } from "../client";

describe("shared session hooks", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns the authenticated actor from the session context", () => {
		useContextMock.mockReturnValue({
			user: {
				fullName: "Carlos Mendes",
				email: "carlos@example.com",
			},
			employee: { id: 7 },
			firm: { id: 1, name: "Matriz" },
			employeeType: { id: 2, value: "LAWYER", label: "Advogado" },
		});

		expect(useLoggedUserSession()).toEqual(
			expect.objectContaining({
				user: expect.objectContaining({
					fullName: "Carlos Mendes",
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

	it("exposes the account profile independently of the business employee", () => {
		useContextMock.mockReturnValue({
			user: {
				fullName: "Amanda Admin",
				email: "amanda@example.com",
			},
			employee: { id: 10 },
			firm: { id: 100, name: "Matriz" },
			employeeType: { id: 3, value: "LAWYER", label: "Advogado" },
		});

		const email = useLoggedUserSession().user.email;

		expect(email).toBe("amanda@example.com");
	});
});
