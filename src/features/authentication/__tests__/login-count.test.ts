import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), memberships: vi.fn() }));
vi.mock("@clerk/tanstack-react-start/server", () => ({
	auth: mocks.auth,
	clerkClient: () => ({
		users: { getOrganizationMembershipList: mocks.memberships },
	}),
}));
vi.mock("@tanstack/react-start", () => ({
	createServerOnlyFn: (fn: unknown) => fn,
}));

import { getLoginOrganizationCount } from "../data/login";

describe("login organization count", () => {
	beforeEach(() => vi.resetAllMocks());
	it("does not query organizations for unauthenticated users", async () => {
		mocks.auth.mockResolvedValue({ userId: null, isAuthenticated: false });
		expect(await getLoginOrganizationCount()).toBe(0);
		expect(mocks.memberships).not.toHaveBeenCalled();
	});
	it("uses the authenticated user and total count instead of page length", async () => {
		mocks.auth.mockResolvedValue({
			userId: "user_current",
			isAuthenticated: true,
		});
		mocks.memberships.mockResolvedValue({ data: [{}], totalCount: 23 });
		expect(await getLoginOrganizationCount()).toBe(23);
		expect(mocks.memberships).toHaveBeenCalledWith({
			userId: "user_current",
			limit: 1,
		});
	});
});
