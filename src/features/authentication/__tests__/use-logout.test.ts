import { beforeEach, describe, expect, it, vi } from "vitest";

const {
	clearAuthenticatedQueryCacheMock,
	mutateAsyncMock,
	navigateMock,
	toastDangerMock,
	useMutationMock,
	useNavigateMock,
	useQueryClientMock,
} = vi.hoisted(() => ({
	clearAuthenticatedQueryCacheMock: vi.fn(),
	mutateAsyncMock: vi.fn(),
	navigateMock: vi.fn(),
	toastDangerMock: vi.fn(),
	useMutationMock: vi.fn(),
	useNavigateMock: vi.fn(),
	useQueryClientMock: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
	useNavigate: useNavigateMock,
}));

vi.mock("@tanstack/react-query", () => ({
	useMutation: useMutationMock,
	useQueryClient: useQueryClientMock,
}));

vi.mock("@/shared/lib/toast", () => ({
	toast: {
		danger: toastDangerMock,
	},
}));

vi.mock("@/shared/session", () => ({
	clearAuthenticatedQueryCache: clearAuthenticatedQueryCacheMock,
}));

vi.mock("../api/mutations", () => ({
	logoutMutationOptions: () => ({
		mutationFn: vi.fn(),
	}),
}));

import { useLogout } from "../hooks/use-logout";

describe("useLogout", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useNavigateMock.mockReturnValue(navigateMock);
		useQueryClientMock.mockReturnValue({
			clear: vi.fn(),
		});
		useMutationMock.mockReturnValue({
			isPending: false,
			mutateAsync: mutateAsyncMock,
		});
		mutateAsyncMock.mockResolvedValue({ success: true });
	});

	it("clears authenticated query cache before redirecting to login", async () => {
		const queryClient = {
			clear: vi.fn(),
		};
		useQueryClientMock.mockReturnValue(queryClient);

		const { handleLogout } = useLogout();

		await handleLogout();

		expect(mutateAsyncMock).toHaveBeenCalledWith({});
		expect(clearAuthenticatedQueryCacheMock).toHaveBeenCalledTimes(1);
		expect(clearAuthenticatedQueryCacheMock).toHaveBeenCalledWith(queryClient);
		expect(navigateMock).toHaveBeenCalledWith({ to: "/login" });
		expect(toastDangerMock).not.toHaveBeenCalled();
	});

	it("shows safe feedback when logout fails", async () => {
		mutateAsyncMock.mockRejectedValue(new Error("boom"));

		const { handleLogout } = useLogout();

		await handleLogout();

		expect(clearAuthenticatedQueryCacheMock).not.toHaveBeenCalled();
		expect(navigateMock).not.toHaveBeenCalled();
		expect(toastDangerMock).toHaveBeenCalledWith("boom");
	});
});
