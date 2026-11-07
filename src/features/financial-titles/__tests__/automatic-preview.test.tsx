// @vitest-environment jsdom
import { FieldApi } from "@tanstack/react-form-start";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useRevenueTitleForm } from "../hooks/use-form";

vi.mock("../api/mutations", () => ({
	generateReceivablesFromRevenueMutationOptions: () => ({
		mutationFn: vi.fn(),
	}),
}));
vi.mock("../api/queries", () => ({
	financialTitleKeys: { all: ["financial-title"] },
}));
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

function setup() {
	const { result } = renderHook(
		() => useRevenueTitleForm({ revenueId: 8, negotiatedAmount: 1000 }),
		{ wrapper: Wrapper },
	);
	const form = result.current.form;
	const fields = {
		count: new FieldApi({ form, name: "installmentCount" }),
		date: new FieldApi({ form, name: "firstDueDate" }),
		entry: new FieldApi({ form, name: "downPaymentAmount" }),
		entryDate: new FieldApi({ form, name: "downPaymentDueDate" }),
		analytic: new FieldApi({ form, name: "analytic" }),
		method: new FieldApi({ form, name: "expectedPaymentMethod" }),
	};
	act(() => {
		for (const field of Object.values(fields)) {
			field.mount();
		}
		fields.date.handleChange("2026-01-31");
		fields.analytic.handleChange("OTHER");
		fields.method.handleChange("PIX");
	});
	return { result, form, fields };
}

afterEach(cleanup);

describe("automatic title preview", () => {
	it("builds without a button and recalculates quantity, entry and dates on field changes", () => {
		const { form, fields } = setup();
		expect(form.state.values.titles.map((title) => title.amount)).toEqual([
			1000,
		]);
		act(() => fields.count.handleChange(3));
		expect(form.state.values.titles.map((title) => title.amount)).toEqual([
			333.34, 333.33, 333.33,
		]);
		act(() => {
			fields.entryDate.handleChange("2026-01-01");
			fields.entry.handleChange(100);
		});
		expect(form.state.values.titles.map((title) => title.amount)).toEqual([
			100, 300, 300, 300,
		]);
		act(() => fields.date.handleChange("2028-01-31"));
		expect(form.state.values.titles[2].dueDate).toBe("2028-02-29");
		act(() => fields.entryDate.handleChange("2026-01-02"));
		expect(form.state.values.titles[0].dueDate).toBe("2026-01-02");
	});
	it("updates category and method while preserving manual edits until schedule changes", () => {
		const { form, fields } = setup();
		const amount = new FieldApi({ form, name: "titles[0].amount" });
		act(() => {
			amount.mount();
			amount.handleChange(999);
		});
		expect(form.state.values.titles[0].amount).toBe(999);
		act(() => fields.analytic.handleChange("FEES"));
		expect(form.state.values.titles[0]).toMatchObject({
			amount: 1000,
			analytic: "FEES",
		});
		act(() => fields.method.handleChange("CASH"));
		expect(form.state.values.titles[0].expectedPaymentMethod).toBe("CASH");
	});
	it("clears stale preview on invalid parameters and rebuilds after correction", () => {
		const { form, fields } = setup();
		act(() => fields.count.handleChange(0));
		expect(form.state.values.titles).toEqual([]);
		act(() => fields.count.handleChange(2));
		expect(form.state.values.titles.map((title) => title.amount)).toEqual([
			500, 500,
		]);
		act(() => fields.method.handleChange(""));
		expect(form.state.values.titles).toEqual([]);
	});
});
