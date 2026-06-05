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
	mutateAsyncMock,
	toastDangerMock,
	useAppFormMock,
	useMutationMock,
	useQueryClientMock,
	useStateMock,
} = vi.hoisted(() => ({
	clearAuthenticatedQueryCacheMock: vi.fn(),
	mutateAsyncMock: vi.fn(),
	toastDangerMock: vi.fn(),
	useAppFormMock: vi.fn(),
	useMutationMock: vi.fn(),
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
	const assignMock = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		capturedFormConfig = null;
		mockedIsCompletingLoginState = false;
		useQueryClientMock.mockReturnValue({});
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
		mutateAsyncMock.mockResolvedValue({
			success: true,
			mustChangePassword: false,
		});
		Object.defineProperty(globalThis, "location", {
			configurable: true,
			value: {
				assign: assignMock,
			},
		});
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
			expect.any(Object),
		);
		expect(assignMock).toHaveBeenCalledWith("/clientes?page=2");
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

		expect(assignMock).toHaveBeenCalledWith("/");
	});

	it("redirects to the forced password-change route when the session requires it", async () => {
		mutateAsyncMock.mockResolvedValueOnce({
			success: true,
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

		expect(assignMock).toHaveBeenCalledWith("/alterar-senha-obrigatoria");
	});

	it("keeps the login state busy until document navigation starts after mutation success", async () => {
		let resolveMutation:
			| ((value: { success: true; mustChangePassword: boolean }) => void)
			| undefined;

		mutateAsyncMock.mockImplementation(
			() =>
				new Promise((resolve) => {
					resolveMutation = resolve;
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

		resolveMutation?.({
			success: true,
			mustChangePassword: false,
		});
		await submitPromise;

		expect(assignMock).toHaveBeenCalledWith("/");
	});
});
