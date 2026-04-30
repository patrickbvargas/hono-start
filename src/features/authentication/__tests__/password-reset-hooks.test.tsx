import { beforeEach, describe, expect, it, vi } from "vitest";
import { AUTHENTICATION_ERRORS } from "../constants/errors";

let capturedRequestFormConfig: {
	onSubmit: (args: { value: { identifier: string } }) => Promise<void>;
} | null = null;

let capturedCompleteFormConfig: {
	onSubmit: (args: {
		value: {
			token: string;
			newPassword: string;
			confirmPassword: string;
		};
	}) => Promise<void>;
} | null = null;

const {
	invalidateQueriesMock,
	mutateAsyncMock,
	navigateMock,
	requestResetMock,
	resetMock,
	toastDangerMock,
	toastSuccessMock,
	useAppFormMock,
	useMutationMock,
	useNavigateMock,
	useQueryClientMock,
} = vi.hoisted(() => ({
	invalidateQueriesMock: vi.fn(),
	mutateAsyncMock: vi.fn(),
	navigateMock: vi.fn(),
	requestResetMock: vi.fn(),
	resetMock: vi.fn(),
	toastDangerMock: vi.fn(),
	toastSuccessMock: vi.fn(),
	useAppFormMock: vi.fn(),
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

vi.mock("@/shared/hooks/use-app-form", () => ({
	useAppForm: useAppFormMock,
}));

vi.mock("@/shared/lib/toast", () => ({
	toast: {
		danger: toastDangerMock,
		success: toastSuccessMock,
	},
}));

vi.mock("@/shared/session/api", () => ({
	sessionKeys: {
		all: ["session"],
	},
}));

vi.mock("../api/mutations", () => ({
	requestPasswordResetMutationOptions: () => ({
		mutationFn: vi.fn(),
	}),
	resetPasswordMutationOptions: () => ({
		mutationFn: vi.fn(),
	}),
}));

import { usePasswordResetCompleteForm } from "../hooks/use-password-reset-complete-form";
import { usePasswordResetRequestForm } from "../hooks/use-password-reset-request-form";

describe("password reset hooks", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		capturedRequestFormConfig = null;
		capturedCompleteFormConfig = null;
		useNavigateMock.mockReturnValue(navigateMock);
		useQueryClientMock.mockReturnValue({
			invalidateQueries: invalidateQueriesMock,
		});
		useMutationMock.mockReturnValue({
			isPending: false,
			mutateAsync: mutateAsyncMock,
		});
		useAppFormMock.mockImplementation((config) => {
			if ("token" in config.defaultValues) {
				capturedCompleteFormConfig = config;
				return {
					...config,
					reset: resetMock,
				};
			}

			capturedRequestFormConfig = config;
			return {
				...config,
				reset: requestResetMock,
			};
		});
		mutateAsyncMock.mockResolvedValue({ success: true });
	});

	it("shows safe success feedback and resets the request form", async () => {
		usePasswordResetRequestForm();

		await capturedRequestFormConfig?.onSubmit({
			value: {
				identifier: "carlos@example.com",
			},
		});

		expect(mutateAsyncMock).toHaveBeenCalledWith({
			data: {
				identifier: "carlos@example.com",
			},
		});
		expect(toastSuccessMock).toHaveBeenCalledWith(
			"Se a conta existir, você receberá um link de redefinição de senha.",
		);
		expect(requestResetMock).toHaveBeenCalledOnce();
		expect(toastDangerMock).not.toHaveBeenCalled();
	});

	it("invalidates session state and redirects to login after successful password reset", async () => {
		usePasswordResetCompleteForm("token-123");

		await capturedCompleteFormConfig?.onSubmit({
			value: {
				token: "token-123",
				newPassword: "SenhaNova123!",
				confirmPassword: "SenhaNova123!",
			},
		});

		expect(mutateAsyncMock).toHaveBeenCalledWith({
			data: {
				token: "token-123",
				newPassword: "SenhaNova123!",
				confirmPassword: "SenhaNova123!",
			},
		});
		expect(invalidateQueriesMock).toHaveBeenCalledWith({
			queryKey: ["session"],
		});
		expect(toastSuccessMock).toHaveBeenCalledWith(
			"Senha redefinida com sucesso.",
		);
		expect(navigateMock).toHaveBeenCalledWith({
			to: "/login",
		});
	});

	it("surfaces safe reset failures without redirecting", async () => {
		mutateAsyncMock.mockRejectedValue(
			new Error(AUTHENTICATION_ERRORS.RESET_INVALID_TOKEN),
		);

		usePasswordResetCompleteForm("expired-token");

		await capturedCompleteFormConfig?.onSubmit({
			value: {
				token: "expired-token",
				newPassword: "SenhaNova123!",
				confirmPassword: "SenhaNova123!",
			},
		});

		expect(toastDangerMock).toHaveBeenCalledWith(
			AUTHENTICATION_ERRORS.RESET_INVALID_TOKEN,
		);
		expect(invalidateQueriesMock).not.toHaveBeenCalled();
		expect(navigateMock).not.toHaveBeenCalled();
	});
});
