// @vitest-environment jsdom

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	cancelQueries: vi.fn(),
	clear: vi.fn(),
	invalidate: vi.fn(),
	danger: vi.fn(),
}));
vi.mock("@tanstack/react-query", () => ({
	useQueryClient: () => ({
		cancelQueries: mocks.cancelQueries,
		clear: mocks.clear,
	}),
}));
vi.mock("@tanstack/react-router", () => ({
	useRouter: () => ({ invalidate: mocks.invalidate }),
}));
vi.mock("@/shared/lib/toast", () => ({ toast: { danger: mocks.danger } }));

import { useAccessRecovery } from "../hooks/use-access-recovery";

afterEach(cleanup);
beforeEach(() => vi.resetAllMocks());

describe("access recovery", () => {
	it("cancels and clears old scope data before revalidating the route", async () => {
		const { result } = renderHook(useAccessRecovery);
		await act(async () => result.current.handleRetry());
		expect(mocks.cancelQueries).toHaveBeenCalledOnce();
		expect(mocks.clear).toHaveBeenCalledOnce();
		expect(mocks.invalidate).toHaveBeenCalledOnce();
		expect(mocks.cancelQueries.mock.invocationCallOrder[0]).toBeLessThan(
			mocks.clear.mock.invocationCallOrder[0],
		);
		expect(mocks.clear.mock.invocationCallOrder[0]).toBeLessThan(
			mocks.invalidate.mock.invocationCallOrder[0],
		);
		expect(result.current.isPending).toBe(false);
	});
	it("reports a safe retry failure and re-enables retry", async () => {
		mocks.invalidate.mockRejectedValue(new Error("private provider details"));
		const { result } = renderHook(useAccessRecovery);
		await act(async () => result.current.handleRetry());
		expect(mocks.danger).toHaveBeenCalledWith(
			"Não foi possível verificar o acesso. Tente novamente.",
		);
		expect(result.current.isPending).toBe(false);
	});
});
