import { beforeEach, describe, expect, it, vi } from "vitest";

let capturedFormConfig: {
	onSubmit: (args: {
		value: {
			identifier: string;
			password: string;
			rememberMe: boolean;
		};
	}) => Promise<void>;
} | null = null;

let mockedIsCompletingLoginState = false;

const {
	clearAuthenticatedQueryCacheMock,
	fetchQueryMock,
	mutateAsyncMock,
	navigateMock,
	toastDangerMock,
	useAppFormMock,
	useMutationMock,
	useNavigateMock,
	useQueryClientMock,
	useStateMock,
} = vi.hoisted(() => ({
	clearAuthenticatedQueryCacheMock: vi.fn(),
	fetchQueryMock: vi.fn(),
	mutateAsyncMock: vi.fn(),
	navigateMock: vi.fn(),
	toastDangerMock: vi.fn(),
	useAppFormMock: vi.fn(),
	useMutationMock: vi.fn(),
	useNavigateMock: vi.fn(),
	useQueryClientMock: vi.fn(),
	useStateMock: vi.fn(),
}));

vi.mock("react", async () => {
	const actual = await vi.importActual<typeof import("react")>("react");

	return {
		...actual,
		useState: useStateMock,
	};
});

vi.mock("@tanstack/react-router", () => ({
	useNavigate: useNavigateMock,
}));

vi.mock("@tanstack/react-query", () => ({
	useMutation: useMutationMock,
	useQueryClient: useQueryClientMock,
}));

vi.mock("@/shared/hooks/use-app-form", () => ({
	useAppForm: useAppFormMock,
}));

vi.mock("@/shared/lib/toast", () => ({
	toast: {
		danger: toastDangerMock,
	},
}));

vi.mock("@/shared/session", () => ({
	clearAuthenticatedQueryCache: clearAuthenticatedQueryCacheMock,
	FORCED_PASSWORD_CHANGE_PATH: "/alterar-senha-obrigatoria",
	getCurrentSessionQueryOptions: () => ({
		queryKey: ["session", "current"],
	}),
	getSafeInternalRedirectPath: (redirectTo?: string) => {
		if (!redirectTo) {
			return undefined;
		}

		if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
			return undefined;
		}

		return redirectTo;
	},
}));

vi.mock("../api/mutations", () => ({
	loginMutationOptions: () => ({
		mutationFn: vi.fn(),
	}),
}));

import { useLoginForm } from "../hooks/use-login-form";

describe("useLoginForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		capturedFormConfig = null;
		mockedIsCompletingLoginState = false;
		useNavigateMock.mockReturnValue(navigateMock);
		useQueryClientMock.mockReturnValue({
			fetchQuery: fetchQueryMock,
		});
		useMutationMock.mockReturnValue({
			isPending: false,
			mutateAsync: mutateAsyncMock,
		});
		useAppFormMock.mockImplementation((config) => {
			capturedFormConfig = config;
			return config;
		});
		useStateMock.mockImplementation((initialValue) => [
			mockedIsCompletingLoginState || initialValue,
			(nextValue: boolean | ((currentValue: boolean) => boolean)) => {
				mockedIsCompletingLoginState =
					typeof nextValue === "function"
						? nextValue(mockedIsCompletingLoginState)
						: nextValue;
			},
		]);
		mutateAsyncMock.mockResolvedValue({ success: true });
		fetchQueryMock.mockResolvedValue({ user: { id: 1 } });
	});

	it("navigates to preserved redirect after successful login", async () => {
		useLoginForm({ redirectTo: "/clientes?page=2" });

		await capturedFormConfig?.onSubmit({
			value: {
				identifier: "carlos@example.com",
				password: "Senha123!",
				rememberMe: false,
			},
		});

		expect(mutateAsyncMock).toHaveBeenCalledWith({
			data: {
				identifier: "carlos@example.com",
				password: "Senha123!",
				rememberMe: false,
			},
		});
		expect(clearAuthenticatedQueryCacheMock).toHaveBeenCalledTimes(1);
		expect(clearAuthenticatedQueryCacheMock).toHaveBeenCalledWith(
			expect.objectContaining({
				fetchQuery: fetchQueryMock,
			}),
		);
		expect(fetchQueryMock).toHaveBeenCalledWith({
			queryKey: ["session", "current"],
		});
		expect(navigateMock).toHaveBeenCalledWith({
			to: "/clientes?page=2",
		});
		expect(toastDangerMock).not.toHaveBeenCalled();
	});

	it("falls back to the dashboard when redirect target is unsafe", async () => {
		useLoginForm({ redirectTo: "https://evil.test" });

		await capturedFormConfig?.onSubmit({
			value: {
				identifier: "carlos@example.com",
				password: "Senha123!",
				rememberMe: false,
			},
		});

		expect(navigateMock).toHaveBeenCalledWith({
			to: "/",
		});
	});

	it("redirects to the forced password-change route when the session requires it", async () => {
		fetchQueryMock.mockResolvedValueOnce({
			user: { id: 1 },
			mustChangePassword: true,
		});

		useLoginForm({ redirectTo: "/clientes?page=2" });

		await capturedFormConfig?.onSubmit({
			value: {
				identifier: "carlos@example.com",
				password: "Senha123!",
				rememberMe: false,
			},
		});

		expect(navigateMock).toHaveBeenCalledWith({
			to: "/alterar-senha-obrigatoria",
		});
	});

	it("keeps the login state busy until navigation finishes after mutation success", async () => {
		let resolveMutation: ((value: { success: true }) => void) | undefined;
		let resolveSession:
			| ((value: {
					user: { id: number };
					mustChangePassword?: boolean;
			  }) => void)
			| undefined;
		let resolveNavigate: (() => void) | undefined;

		mutateAsyncMock.mockImplementation(
			() =>
				new Promise((resolve) => {
					resolveMutation = resolve;
				}),
		);
		fetchQueryMock.mockImplementation(
			() =>
				new Promise((resolve) => {
					resolveSession = resolve;
				}),
		);
		navigateMock.mockImplementation(
			() =>
				new Promise<void>((resolve) => {
					resolveNavigate = resolve;
				}),
		);

		expect(useLoginForm().isPending).toBe(false);

		useLoginForm();

		const submitPromise = capturedFormConfig?.onSubmit({
			value: {
				identifier: "carlos@example.com",
				password: "Senha123!",
				rememberMe: false,
			},
		});

		expect(useLoginForm().isPending).toBe(true);

		resolveMutation?.({ success: true });
		await Promise.resolve();

		expect(useLoginForm().isPending).toBe(true);

		resolveSession?.({
			user: { id: 1 },
			mustChangePassword: false,
		});
		await Promise.resolve();

		expect(useLoginForm().isPending).toBe(true);

		resolveNavigate?.();
		await submitPromise;
	});
});
