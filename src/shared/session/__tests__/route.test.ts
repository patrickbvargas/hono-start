import { beforeEach, describe, expect, it, vi } from "vitest";

const { redirectMock } = vi.hoisted(() => ({
	redirectMock: vi.fn(({ to }) => ({ to })),
}));

vi.mock("@tanstack/react-router", () => ({
	redirect: redirectMock,
}));

vi.mock("../api", () => ({
	sessionKeys: {
		current: () => ["session", "current"],
	},
	getCurrentSessionQueryOptions: () => ({ queryKey: ["session", "current"] }),
}));

import { getRouteSession, requireRouteSession } from "../route";

describe("route session helpers", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns required session data when the query succeeds", async () => {
		const queryClient = {
			ensureQueryData: vi.fn().mockResolvedValue({ user: { id: 7 } }),
		};

		await expect(requireRouteSession(queryClient as never)).resolves.toEqual({
			user: { id: 7 },
		});
		expect(queryClient.ensureQueryData).toHaveBeenCalledWith({
			queryKey: ["session", "current"],
		});
	});

	it("redirects protected routes to /login when the shared session query rejects", async () => {
		const queryClient = {
			ensureQueryData: vi.fn().mockRejectedValue(new Error("unauthorized")),
			setQueryData: vi.fn(),
		};

		await expect(requireRouteSession(queryClient as never)).rejects.toEqual({
			to: "/login",
		});
		expect(queryClient.setQueryData).toHaveBeenCalledWith(
			["session", "current"],
			null,
		);
		expect(redirectMock).toHaveBeenCalledWith({ to: "/login" });
	});

	it("redirects protected routes to /login when the shared session query resolves to null", async () => {
		const queryClient = {
			ensureQueryData: vi.fn().mockResolvedValue(null),
			setQueryData: vi.fn(),
		};

		await expect(requireRouteSession(queryClient as never)).rejects.toEqual({
			to: "/login",
		});
		expect(queryClient.setQueryData).toHaveBeenCalledWith(
			["session", "current"],
			null,
		);
		expect(redirectMock).toHaveBeenCalledWith({ to: "/login" });
	});

	it("reads public-route session state from the shared session query without redirecting", async () => {
		const queryClient = {
			ensureQueryData: vi.fn().mockResolvedValue(null),
		};

		await expect(getRouteSession(queryClient as never)).resolves.toBeNull();
		expect(queryClient.ensureQueryData).toHaveBeenCalledWith({
			queryKey: ["session", "current"],
		});
	});
});
