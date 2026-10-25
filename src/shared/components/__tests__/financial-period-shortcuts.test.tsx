// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	FinancialPeriodShortcuts,
	getMonthRange,
} from "../financial-period-shortcuts";

afterEach(cleanup);
describe("financial period shortcuts", () => {
	it("resolves leap years and December using calendar dates", () => {
		expect(getMonthRange(new Date(2024, 1, 15))).toEqual({
			dateFrom: "2024-02-01",
			dateTo: "2024-02-29",
		});
		expect(getMonthRange(new Date(2026, 11, 15))).toEqual({
			dateFrom: "2026-12-01",
			dateTo: "2026-12-31",
		});
	});
	it("clears only dates and exposes the active shortcut", () => {
		const onChange = vi.fn();
		render(
			<FinancialPeriodShortcuts dateFrom="" dateTo="" onChange={onChange} />,
		);
		const all = screen.getByRole("button", { name: "Todo período" });
		expect(all.getAttribute("aria-pressed")).toBe("true");
		fireEvent.click(all);
		expect(onChange).toHaveBeenCalledWith({ dateFrom: "", dateTo: "" });
		fireEvent.click(screen.getByRole("button", { name: "Este mês" }));
		expect(onChange).toHaveBeenLastCalledWith(getMonthRange());
	});
});
