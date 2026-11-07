// @vitest-environment jsdom

import { FieldApi } from "@tanstack/react-form-start";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useReversalForm, useSettlementForm } from "../hooks/use-form";

const mocks = vi.hoisted(() => ({
	create: vi.fn(),
	reverse: vi.fn(),
	refresh: vi.fn(),
	danger: vi.fn(),
	success: vi.fn(),
}));
vi.mock("../api/mutations", () => ({
	createSettlementMutationOptions: () => ({ mutationFn: mocks.create }),
	reverseSettlementMutationOptions: () => ({ mutationFn: mocks.reverse }),
}));
vi.mock("../utils/refresh", () => ({
	refreshSettlementQueries: mocks.refresh,
}));
vi.mock("@/shared/lib/toast", () => ({
	toast: { danger: mocks.danger, success: mocks.success },
}));
function Wrapper({ children }: { children: ReactNode }) {
	return (
		<QueryClientProvider client={new QueryClient()}>
			{children}
		</QueryClientProvider>
	);
}
beforeEach(() => {
	vi.resetAllMocks();
	mocks.create.mockResolvedValue({ success: true });
	mocks.reverse.mockResolvedValue({ success: true });
});
afterEach(cleanup);
describe("settlement form orchestration", () => {
	it("prefills remaining principal and remuneration for contracts; refreshes on success", async () => {
		const onSuccess = vi.fn();
		const { result } = renderHook(
			() =>
				useSettlementForm({
					target: { direction: "receivable", titleId: 5 },
					balance: 60,
					method: "PIX",
					isContract: true,
					onSuccess,
				}),
			{ wrapper: Wrapper },
		);
		expect(result.current.form.state.values).toMatchObject({
			principalAbated: 60,
			generatesRemuneration: true,
			discount: 0,
		});
		await act(async () => result.current.form.handleSubmit());
		expect(mocks.create).toHaveBeenCalledWith(
			{
				data: expect.objectContaining({
					titleId: 5,
					principalAbated: 60,
					generatesRemuneration: true,
				}),
			},
			expect.anything(),
		);
		expect(mocks.refresh).toHaveBeenCalledOnce();
		expect(onSuccess).toHaveBeenCalledOnce();
	});
	it("preserves request key and draft after failure for safe retry", async () => {
		mocks.create.mockRejectedValueOnce(new Error("Falha de conexão"));
		const onSuccess = vi.fn();
		const { result } = renderHook(
			() =>
				useSettlementForm({
					target: { direction: "payable", titleId: 5 },
					balance: 60,
					method: "PIX",
					isContract: false,
					onSuccess,
				}),
			{ wrapper: Wrapper },
		);
		const key = result.current.form.state.values.requestKey;
		await act(async () => result.current.form.handleSubmit());
		expect(onSuccess).not.toHaveBeenCalled();
		expect(mocks.danger).toHaveBeenCalledWith("Falha de conexão");
		await act(async () => result.current.form.handleSubmit());
		expect(
			mocks.create.mock.calls.map(([args]) => args.data.requestKey),
		).toEqual([key, key]);
		expect(result.current.form.state.values.generatesRemuneration).toBe(false);
	});
	it("requires reason before reversing and submits selected movement", async () => {
		const onSuccess = vi.fn();
		const { result } = renderHook(
			() =>
				useReversalForm({
					target: { direction: "payable", titleId: 5 },
					movementId: 30,
					onSuccess,
				}),
			{ wrapper: Wrapper },
		);
		const reason = new FieldApi({ form: result.current.form, name: "reason" });
		act(() => {
			reason.mount();
		});
		await act(async () => result.current.form.handleSubmit());
		expect(mocks.reverse).not.toHaveBeenCalled();
		act(() => reason.handleChange("Duplicidade"));
		await act(async () => result.current.form.handleSubmit());
		expect(mocks.reverse).toHaveBeenCalledWith(
			{
				data: expect.objectContaining({
					titleId: 5,
					movementId: 30,
					reason: "Duplicidade",
				}),
			},
			expect.anything(),
		);
		expect(onSuccess).toHaveBeenCalledOnce();
	});
});
