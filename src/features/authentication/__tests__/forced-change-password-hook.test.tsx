import { beforeEach, describe, expect, it, vi } from "vitest";
import { AUTHENTICATION_ERRORS } from "../constants/errors";

let capturedFormConfig: {
	onSubmit: (args: {
		value: {
			newPassword: string;
			confirmPassword: string;
			revokeOtherSessions: boolean;
		};
	}) => Promise<void>;
	defaultValues: {
		newPassword: string;
		confirmPassword: string;
		revokeOtherSessions: boolean;
	};
} | null = null;

const {
	mutateAsyncMock,
	queryClientClearMock,
	resetMock,
	toastDangerMock,
	toastSuccessMock,
	useAppFormMock,
	useMutationMock,
	useQueryClientMock,
} = vi.hoisted(() => ({
	mutateAsyncMock: vi.fn(),
	queryClientClearMock: vi.fn(),
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

vi.mock("../api/mutations", () => ({
	forcedChangePasswordMutationOptions: () => ({
		mutationFn: vi.fn(),
	}),
}));

import { useForcedChangePasswordForm } from "../hooks/use-forced-change-password-form";

describe("forced change password hook", () => {
	const locationReplaceMock = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		capturedFormConfig = null;
		useQueryClientMock.mockReturnValue({
			clear: queryClientClearMock,
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
		vi.stubGlobal("window", {
			location: {
				replace: locationReplaceMock,
			},
		});
	});

	it("clears query state, resets the form, and forces a dashboard reload", async () => {
		useForcedChangePasswordForm();

		await capturedFormConfig?.onSubmit({
			value: {
				newPassword: "SenhaNova123!",
				confirmPassword: "SenhaNova123!",
				revokeOtherSessions: true,
			},
		});

		expect(mutateAsyncMock).toHaveBeenCalledWith({
			data: {
				newPassword: "SenhaNova123!",
				confirmPassword: "SenhaNova123!",
				revokeOtherSessions: true,
			},
		});
		expect(toastSuccessMock).toHaveBeenCalledWith(
			"Senha alterada com sucesso.",
		);
		expect(resetMock).toHaveBeenCalledOnce();
		expect(queryClientClearMock).toHaveBeenCalledOnce();
		expect(locationReplaceMock).toHaveBeenCalledWith("/");
	});

	it("surfaces safe forced-change failures without redirecting", async () => {
		mutateAsyncMock.mockRejectedValue(
			new Error(AUTHENTICATION_ERRORS.CHANGE_PASSWORD_FAILED),
		);

		useForcedChangePasswordForm();

		await capturedFormConfig?.onSubmit({
			value: {
				newPassword: "SenhaNova123!",
				confirmPassword: "SenhaNova123!",
				revokeOtherSessions: false,
			},
		});

		expect(toastDangerMock).toHaveBeenCalledWith(
			AUTHENTICATION_ERRORS.CHANGE_PASSWORD_FAILED,
		);
		expect(queryClientClearMock).not.toHaveBeenCalled();
		expect(locationReplaceMock).not.toHaveBeenCalled();
	});
});
