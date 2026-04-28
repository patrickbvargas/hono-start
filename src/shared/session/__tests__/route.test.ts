import { beforeEach, describe, expect, it, vi } from "vitest";

const { redirectMock } = vi.hoisted(() => ({
	redirectMock: vi.fn(({ to }) => ({ to })),
}));

vi.mock("@tanstack/react-router", () => ({
	redirect: redirectMock,
}));

vi.mock("../api", () => ({
	getCurrentSessionQueryOptions: () => ({ queryKey: ["session", "required"] }),
	getOptionalCurrentSessionQueryOptions: () => ({
		queryKey: ["session", "optional"],
	}),
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
			queryKey: ["session", "required"],
		});
	});

	it("redirects unauthenticated protected routes to /login", async () => {
		const queryClient = {
			ensureQueryData: vi.fn().mockRejectedValue(new Error("unauthorized")),
		};

		await expect(requireRouteSession(queryClient as never)).rejects.toEqual({
			to: "/login",
		});
		expect(redirectMock).toHaveBeenCalledWith({ to: "/login" });
	});

	it("reads optional public-route session state without redirecting", async () => {
		const queryClient = {
			ensureQueryData: vi.fn().mockResolvedValue(null),
		};

		await expect(getRouteSession(queryClient as never)).resolves.toBeNull();
		expect(queryClient.ensureQueryData).toHaveBeenCalledWith({
			queryKey: ["session", "optional"],
		});
	});
});
