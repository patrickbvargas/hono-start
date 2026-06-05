import { beforeEach, describe, expect, it, vi } from "vitest";

const {
	createSupabaseServerClientMock,
	flushResponseCookiesMock,
	isSupabaseAuthUserBannedMock,
	prismaMock,
	signOutMock,
} = vi.hoisted(() => ({
	createSupabaseServerClientMock: vi.fn(),
	flushResponseCookiesMock: vi.fn(),
	isSupabaseAuthUserBannedMock: vi.fn(),
	prismaMock: {
		employee: {
			findFirst: vi.fn(),
		},
	},
	signOutMock: vi.fn(),
}));

vi.mock("@/shared/lib/prisma", () => ({
	prisma: prismaMock,
}));

vi.mock("@/shared/lib/supabase-admin", () => ({
	isSupabaseAuthUserBanned: isSupabaseAuthUserBannedMock,
}));

vi.mock("@/shared/lib/supabase-server", () => ({
	createSupabaseServerClient: createSupabaseServerClientMock,
}));

import {
	getOptionalServerLoggedUserSession,
	getRequiredServerLoggedUserSession,
} from "../server";

const activeEmployee = {
	id: 7,
	fullName: "Carlos Mendes",
	email: "carlos@example.com",
	mustChangePassword: false,
	firm: {
		id: 1,
		name: "Matriz",
	},
	role: {
		id: 2,
		value: "USER",
		label: "Usuário",
	},
	type: {
		id: 3,
		value: "LAWYER",
		label: "Advogado",
	},
};

function mockSupabaseUser(userId: string | null) {
	createSupabaseServerClientMock.mockReturnValue({
		client: {
			auth: {
				getUser: vi.fn().mockResolvedValue({
					data: {
						user: userId ? { id: userId } : null,
					},
					error: null,
				}),
				signOut: signOutMock,
			},
		},
		flushResponseCookies: flushResponseCookiesMock,
		rememberMe: false,
	});
}

describe("server session helpers", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		signOutMock.mockResolvedValue({ error: null });
		isSupabaseAuthUserBannedMock.mockReturnValue(false);
		prismaMock.employee.findFirst.mockResolvedValue(activeEmployee);
		mockSupabaseUser(null);
	});

	it("returns null when there is no authenticated Supabase session", async () => {
		await expect(getOptionalServerLoggedUserSession()).resolves.toBeNull();
		expect(prismaMock.employee.findFirst).not.toHaveBeenCalled();
		expect(flushResponseCookiesMock).toHaveBeenCalledOnce();
	});

	it("maps the authenticated Supabase user to the domain session actor", async () => {
		mockSupabaseUser("11111111-1111-1111-1111-111111111111");

		await expect(getOptionalServerLoggedUserSession()).resolves.toEqual({
			user: {
				id: 7,
				fullName: "Carlos Mendes",
				email: "carlos@example.com",
			},
			employee: {
				id: 7,
			},
			firm: activeEmployee.firm,
			employeeType: activeEmployee.type,
			role: activeEmployee.role,
			mustChangePassword: false,
		});

		expect(prismaMock.employee.findFirst).toHaveBeenCalledWith({
			where: {
				authUserId: "11111111-1111-1111-1111-111111111111",
				deletedAt: null,
				isActive: true,
			},
			select: expect.any(Object),
		});
	});

	it("signs out orphaned Supabase sessions that no longer map to an active employee", async () => {
		createSupabaseServerClientMock
			.mockReturnValueOnce({
				client: {
					auth: {
						getUser: vi.fn().mockResolvedValue({
							data: {
								user: { id: "11111111-1111-1111-1111-111111111111" },
							},
							error: null,
						}),
						signOut: signOutMock,
					},
				},
				flushResponseCookies: flushResponseCookiesMock,
				rememberMe: false,
			})
			.mockReturnValueOnce({
				client: {
					auth: {
						getUser: vi.fn(),
						signOut: signOutMock,
					},
				},
				flushResponseCookies: flushResponseCookiesMock,
				rememberMe: false,
			});
		prismaMock.employee.findFirst.mockResolvedValue(null);

		await expect(getOptionalServerLoggedUserSession()).resolves.toBeNull();

		expect(signOutMock).toHaveBeenCalledWith({
			scope: "local",
		});
		expect(createSupabaseServerClientMock).toHaveBeenCalledTimes(2);
	});

	it("throws the pt-BR unauthenticated message for required sessions", async () => {
		await expect(getRequiredServerLoggedUserSession()).rejects.toThrow(
			"Sua sessão expirou. Faça login novamente.",
		);
	});
});
