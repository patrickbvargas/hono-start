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

const {
	fetchQueryMock,
	invalidadeQueriesMock,
	mutateAsyncMock,
	navigateMock,
	toastDangerMock,
	useAppFormMock,
	useMutationMock,
	useNavigateMock,
	useQueryClientMock,
} = vi.hoisted(() => ({
	fetchQueryMock: vi.fn(),
	invalidadeQueriesMock: vi.fn(),
	mutateAsyncMock: vi.fn(),
	navigateMock: vi.fn(),
	toastDangerMock: vi.fn(),
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
	},
}));

vi.mock("@/shared/session/api", () => ({
	getCurrentSessionQueryOptions: () => ({
		queryKey: ["session", "current"],
	}),
	sessionKeys: {
		all: ["session"],
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
		useNavigateMock.mockReturnValue(navigateMock);
		useQueryClientMock.mockReturnValue({
			fetchQuery: fetchQueryMock,
			invalidateQueries: invalidadeQueriesMock,
		});
		useMutationMock.mockReturnValue({
			isPending: false,
			mutateAsync: mutateAsyncMock,
		});
		useAppFormMock.mockImplementation((config) => {
			capturedFormConfig = config;
			return config;
		});
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
		expect(invalidadeQueriesMock).toHaveBeenCalledWith({
			queryKey: ["session"],
		});
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
});
