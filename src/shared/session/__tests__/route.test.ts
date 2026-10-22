import { beforeEach, describe, expect, it, vi } from "vitest";

const { redirectMock } = vi.hoisted(() => ({
	redirectMock: vi.fn(({ to, search }) => ({ to, search })),
}));

vi.mock("@tanstack/react-router", async (importOriginal) => ({
	...(await importOriginal<typeof import("@tanstack/react-router")>()),
	redirect: redirectMock,
}));

import {
	getRouteSession,
	getSafeInternalRedirectPath,
	requireRouteSession,
} from "../client";

describe("route session helpers", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns required session data when the query succeeds", async () => {
		const queryClient = {
			fetchQuery: vi.fn().mockResolvedValue({ user: { id: 7 } }),
		};

		await expect(requireRouteSession(queryClient as never)).resolves.toEqual({
			user: { id: 7 },
		});
		expect(queryClient.fetchQuery).toHaveBeenCalledWith(
			expect.objectContaining({
				queryKey: ["session", "current"],
			}),
		);
	});

	it("redirects protected routes to /login when the shared session query rejects", async () => {
		const queryClient = {
			fetchQuery: vi.fn().mockRejectedValue(new Error("unauthorized")),
			setQueryData: vi.fn(),
		};

		await expect(requireRouteSession(queryClient as never)).rejects.toEqual({
			to: "/login",
			search: undefined,
		});
		expect(queryClient.setQueryData).toHaveBeenCalledWith(
			["session", "current"],
			null,
		);
		expect(redirectMock).toHaveBeenCalledWith({
			to: "/login",
			search: undefined,
		});
	});

	it("redirects protected routes to /login when the shared session query resolves to null", async () => {
		const queryClient = {
			fetchQuery: vi.fn().mockResolvedValue(null),
			setQueryData: vi.fn(),
		};

		await expect(
			requireRouteSession(queryClient as never, "/clientes?page=2"),
		).rejects.toEqual({
			to: "/login",
			search: { redirect: "/clientes?page=2" },
		});
		expect(queryClient.setQueryData).toHaveBeenCalledWith(
			["session", "current"],
			null,
		);
		expect(redirectMock).toHaveBeenCalledWith({
			to: "/login",
			search: { redirect: "/clientes?page=2" },
		});
	});

	it("reads public-route session state from the shared session query without redirecting", async () => {
		const queryClient = {
			fetchQuery: vi.fn().mockResolvedValue(null),
		};

		await expect(getRouteSession(queryClient as never)).resolves.toBeNull();
		expect(queryClient.fetchQuery).toHaveBeenCalledWith(
			expect.objectContaining({
				queryKey: ["session", "current"],
			}),
		);
	});

	it("accepts only safe internal redirect targets", () => {
		expect(getSafeInternalRedirectPath("/clientes?page=2")).toBe(
			"/clientes?page=2",
		);
		expect(getSafeInternalRedirectPath("/")).toBe("/");
		expect(getSafeInternalRedirectPath("/login")).toBeUndefined();
		expect(
			getSafeInternalRedirectPath("/recuperar-senha?token=abc"),
		).toBeUndefined();
		expect(getSafeInternalRedirectPath("https://evil.test")).toBeUndefined();
		expect(getSafeInternalRedirectPath("//evil.test")).toBeUndefined();
		expect(getSafeInternalRedirectPath(undefined)).toBeUndefined();
	});
});
