import { beforeEach, describe, expect, it, vi } from "vitest";
import { AUTHENTICATION_ERRORS } from "../constants/errors";

let capturedFormConfig: {
	onSubmit: (args: {
		value: {
			currentPassword: string;
			newPassword: string;
			confirmPassword: string;
			revokeOtherSessions: boolean;
		};
	}) => Promise<void>;
	defaultValues: {
		currentPassword: string;
		newPassword: string;
		confirmPassword: string;
		revokeOtherSessions: boolean;
	};
} | null = null;

const {
	invalidateQueriesMock,
	mutateAsyncMock,
	onSuccessMock,
	resetMock,
	toastDangerMock,
	toastSuccessMock,
	useAppFormMock,
	useMutationMock,
	useQueryClientMock,
} = vi.hoisted(() => ({
	invalidateQueriesMock: vi.fn(),
	mutateAsyncMock: vi.fn(),
	onSuccessMock: vi.fn(),
	resetMock: vi.fn(),
	toastDangerMock: vi.fn(),
	toastSuccessMock: vi.fn(),
	useAppFormMock: vi.fn(),
	useMutationMock: vi.fn(),
	useQueryClientMock: vi.fn(),
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
	changePasswordMutationOptions: () => ({
		mutationFn: vi.fn(),
	}),
}));

import { useChangePasswordForm } from "../hooks/use-change-password-form";

describe("change password hook", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		capturedFormConfig = null;
		useQueryClientMock.mockReturnValue({
			invalidateQueries: invalidateQueriesMock,
		});
		useMutationMock.mockReturnValue({
			isPending: false,
			mutateAsync: mutateAsyncMock,
		});
		useAppFormMock.mockImplementation((config) => {
			capturedFormConfig = config;
			return {
				...config,
				reset: resetMock,
			};
		});
		mutateAsyncMock.mockResolvedValue({ success: true });
	});

	it("invalidates session state, resets the form, and closes on success", async () => {
		useChangePasswordForm({
			onSuccess: onSuccessMock,
		});

		await capturedFormConfig?.onSubmit({
			value: {
				currentPassword: "Senha123!",
				newPassword: "SenhaNova123!",
				confirmPassword: "SenhaNova123!",
				revokeOtherSessions: true,
			},
		});

		expect(mutateAsyncMock).toHaveBeenCalledWith({
			data: {
				currentPassword: "Senha123!",
				newPassword: "SenhaNova123!",
				confirmPassword: "SenhaNova123!",
				revokeOtherSessions: true,
			},
		});
		expect(invalidateQueriesMock).toHaveBeenCalledWith({
			queryKey: ["session"],
		});
		expect(toastSuccessMock).toHaveBeenCalledWith(
			"Senha alterada com sucesso.",
		);
		expect(resetMock).toHaveBeenCalledOnce();
		expect(onSuccessMock).toHaveBeenCalledOnce();
	});

	it("surfaces safe change-password failures without closing", async () => {
		mutateAsyncMock.mockRejectedValue(
			new Error(AUTHENTICATION_ERRORS.CHANGE_PASSWORD_INVALID_CURRENT),
		);

		useChangePasswordForm({
			onSuccess: onSuccessMock,
		});

		await capturedFormConfig?.onSubmit({
			value: {
				currentPassword: "SenhaErrada123!",
				newPassword: "SenhaNova123!",
				confirmPassword: "SenhaNova123!",
				revokeOtherSessions: false,
			},
		});

		expect(toastDangerMock).toHaveBeenCalledWith(
			AUTHENTICATION_ERRORS.CHANGE_PASSWORD_INVALID_CURRENT,
		);
		expect(invalidateQueriesMock).not.toHaveBeenCalled();
		expect(resetMock).not.toHaveBeenCalled();
		expect(onSuccessMock).not.toHaveBeenCalled();
	});
});
