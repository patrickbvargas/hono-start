import { beforeEach, describe, expect, it, vi } from "vitest";

const {
	deleteClientMutationOptionsMock,
	getMutationErrorMessageMock,
	mutateAsyncMock,
	queryClientMock,
	refreshEntityQueriesMock,
	restoreClientMutationOptionsMock,
	toastDangerMock,
	toastSuccessMock,
	useMutationMock,
	useQueryClientMock,
} = vi.hoisted(() => ({
	deleteClientMutationOptionsMock: vi.fn(() => ({ mutationFn: "delete" })),
	getMutationErrorMessageMock: vi.fn(() => "Erro seguro"),
	mutateAsyncMock: vi.fn(),
	queryClientMock: {},
	refreshEntityQueriesMock: vi.fn(),
	restoreClientMutationOptionsMock: vi.fn(() => ({ mutationFn: "restore" })),
	toastDangerMock: vi.fn(),
	toastSuccessMock: vi.fn(),
	useMutationMock: vi.fn(),
	useQueryClientMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
	useMutation: useMutationMock,
	useQueryClient: useQueryClientMock,
}));

vi.mock("@/shared/lib/entity-management", () => ({
	getMutationErrorMessage: getMutationErrorMessageMock,
	refreshEntityQueries: refreshEntityQueriesMock,
}));

vi.mock("@/shared/lib/toast", () => ({
	toast: {
		danger: toastDangerMock,
		success: toastSuccessMock,
	},
}));

vi.mock("../api/mutations", () => ({
	deleteClientMutationOptions: deleteClientMutationOptionsMock,
	restoreClientMutationOptions: restoreClientMutationOptionsMock,
}));

import { CLIENT_DATA_CACHE_KEY } from "../constants/cache";
import { useClientDelete } from "../hooks/use-delete";
import { useClientRestore } from "../hooks/use-restore";

describe("client lifecycle hooks", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useQueryClientMock.mockReturnValue(queryClientMock);
		useMutationMock.mockReturnValue({
			mutateAsync: mutateAsyncMock,
			isPending: false,
		});
		refreshEntityQueriesMock.mockResolvedValue(undefined);
		mutateAsyncMock.mockResolvedValue({ success: true });
	});

	it("confirms delete with current id, success toast, cache refresh, and callback", async () => {
		const onSuccess = vi.fn();
		const { handleConfirm, isPending } = useClientDelete({ onSuccess });

		await handleConfirm(123);

		expect(isPending).toBe(false);
		expect(deleteClientMutationOptionsMock).toHaveBeenCalledOnce();
		expect(mutateAsyncMock).toHaveBeenCalledWith({ data: { id: 123 } });
		expect(toastSuccessMock).toHaveBeenCalledWith(
			"Cliente excluído com sucesso.",
		);
		expect(refreshEntityQueriesMock).toHaveBeenCalledWith(
			queryClientMock,
			CLIENT_DATA_CACHE_KEY,
		);
		expect(onSuccess).toHaveBeenCalledOnce();
	});

	it("confirms restore with current id, success toast, cache refresh, and callback", async () => {
		const onSuccess = vi.fn();
		const { handleConfirm } = useClientRestore({ onSuccess });

		await handleConfirm(456);

		expect(restoreClientMutationOptionsMock).toHaveBeenCalledOnce();
		expect(mutateAsyncMock).toHaveBeenCalledWith({ data: { id: 456 } });
		expect(toastSuccessMock).toHaveBeenCalledWith(
			"Cliente restaurado com sucesso.",
		);
		expect(refreshEntityQueriesMock).toHaveBeenCalledWith(
			queryClientMock,
			CLIENT_DATA_CACHE_KEY,
		);
		expect(onSuccess).toHaveBeenCalledOnce();
	});

	it("shows safe error feedback and does not refresh cache on failure", async () => {
		mutateAsyncMock.mockRejectedValue(new Error("internal detail"));

		const { handleConfirm } = useClientDelete({ onSuccess: vi.fn() });

		await handleConfirm(123);

		expect(getMutationErrorMessageMock).toHaveBeenCalledWith(
			new Error("internal detail"),
		);
		expect(toastDangerMock).toHaveBeenCalledWith("Erro seguro");
		expect(refreshEntityQueriesMock).not.toHaveBeenCalled();
	});
});
