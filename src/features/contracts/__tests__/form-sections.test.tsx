// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	act,
	cleanup,
	fireEvent,
	render,
	renderHook,
	screen,
	waitFor,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useContractForm } from "../hooks/use-form";
import { useContractFormSections } from "../hooks/use-form-sections";
import { defaultContractRevenueValues } from "../utils/default";

vi.mock("../api/mutations", () => ({
	createContractMutationOptions: () => ({ mutationFn: vi.fn() }),
	updateContractMutationOptions: () => ({ mutationFn: vi.fn() }),
}));
vi.mock("../api/queries", () => ({ contractKeys: { all: ["contracts"] } }));
vi.mock("@/features/audit-logs", () => ({
	refreshAuditedEntityQueries: vi.fn(),
}));
vi.mock("@/shared/lib/toast", () => ({
	toast: { danger: vi.fn(), success: vi.fn() },
}));
function Wrapper({ children }: { children: ReactNode }) {
	return (
		<QueryClientProvider client={new QueryClient()}>
			{children}
		</QueryClientProvider>
	);
}
function useHarness() {
	const { form } = useContractForm({});
	return { form, ...useContractFormSections({ form }) };
}

function Harness() {
	const sections = useHarness();
	return (
		<>
			<button
				type="button"
				onClick={() => sections.focusAddedRow("assignments", 0)}
			>
				Adicionar
			</button>
			<div data-contract-row={sections.getRowKey("assignments", 0)}>
				<input aria-label="Colaborador" />
			</div>
		</>
	);
}

describe("contract form sections", () => {
	afterEach(() => {
		cleanup();
		vi.unstubAllGlobals();
	});
	it("keeps row keys stable on edits and moves them with surviving rows", () => {
		const { result } = renderHook(useHarness, { wrapper: Wrapper });
		const first = result.current.getRowKey("assignments", 0);
		const second = result.current.getRowKey("assignments", 1);
		act(() =>
			result.current.form.setFieldValue("assignments[0].employeeId", "7"),
		);
		expect(result.current.getRowKey("assignments", 0)).toBe(first);
		act(() => result.current.removeRowKey("assignments", 0));
		expect(result.current.getRowKey("assignments", 0)).toBe(second);
		expect(result.current.getRowKey("assignments", 1)).not.toBe(first);
	});
	it("exposes incomplete and invalid revenues but allows valid revenues to collapse", () => {
		const { result } = renderHook(useHarness, { wrapper: Wrapper });
		const valid = {
			...defaultContractRevenueValues(),
			type: "JUDICIAL",
			totalValue: 1200,
			paymentStartDate: "2026-10-24",
		};
		expect(
			result.current.isRevenueRequiredOpen(defaultContractRevenueValues(), 0),
		).toBe(true);
		expect(result.current.isRevenueRequiredOpen(valid, 0)).toBe(false);
		expect(
			result.current.isRevenueRequiredOpen(
				{ ...valid, downPaymentValue: 1300 },
				0,
			),
		).toBe(true);
	});
	it("focuses the first field of the requested added row", async () => {
		vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
			setTimeout(() => callback(0), 0),
		);
		vi.stubGlobal("cancelAnimationFrame", clearTimeout);

		render(<Harness />, { wrapper: Wrapper });
		fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));
		await waitFor(() =>
			expect(document.activeElement).toBe(
				screen.getByRole("textbox", { name: "Colaborador" }),
			),
		);
	});
});
