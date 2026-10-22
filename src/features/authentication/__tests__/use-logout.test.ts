import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	signOut: vi.fn(),
	cancel: vi.fn(),
	clear: vi.fn(),
	navigate: vi.fn(),
	danger: vi.fn(),
}));
vi.mock("react", () => ({ useState: () => [false, vi.fn()] }));
vi.mock("@clerk/tanstack-react-start", () => ({
	useClerk: () => ({ signOut: mocks.signOut }),
}));
vi.mock("@tanstack/react-query", () => ({
	useQueryClient: () => ({ cancelQueries: mocks.cancel, clear: mocks.clear }),
}));
vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => mocks.navigate,
}));
vi.mock("@/shared/lib/toast", () => ({ toast: { danger: mocks.danger } }));

import { useLogout } from "../hooks/use-logout";

describe("Clerk logout", () => {
	beforeEach(() => vi.resetAllMocks());
	it("cancels old requests and clears protected data before leaving", async () => {
		await useLogout().handleLogout();
		expect(mocks.cancel).toHaveBeenCalled();
		expect(mocks.clear.mock.invocationCallOrder[0]).toBeLessThan(
			mocks.signOut.mock.invocationCallOrder[0],
		);
		expect(mocks.navigate).toHaveBeenCalledWith({ to: "/login" });
	});
	it("keeps provider failures out of feedback", async () => {
		mocks.signOut.mockRejectedValue(new Error("private details"));
		await useLogout().handleLogout();
		expect(mocks.danger).toHaveBeenCalledWith(
			"Não foi possível encerrar a sessão.",
		);
		expect(mocks.navigate).not.toHaveBeenCalled();
	});
});
