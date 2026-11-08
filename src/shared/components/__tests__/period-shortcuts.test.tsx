// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	getCurrentYearRange,
	getMonthRange,
	PeriodShortcuts,
} from "../period-shortcuts";

afterEach(cleanup);

describe("period shortcuts", () => {
	it("resolves month and year ranges accurately", () => {
		expect(getMonthRange(new Date(2024, 1, 15))).toEqual({
			dateFrom: "2024-02-01",
			dateTo: "2024-02-29",
		});
		expect(getMonthRange(new Date(2026, 11, 15))).toEqual({
			dateFrom: "2026-12-01",
			dateTo: "2026-12-31",
		});
		expect(getCurrentYearRange(new Date(2026, 5, 10))).toEqual({
			dateFrom: "2026-01-01",
			dateTo: "2026-06-10",
		});
	});

	it("renders default presets and responds to click", () => {
		const onChange = vi.fn();
		render(<PeriodShortcuts dateFrom="" dateTo="" onChange={onChange} />);

		const all = screen.getByRole("button", { name: "Todo período" });
		expect(all.getAttribute("aria-pressed")).toBe("true");

		fireEvent.click(all);
		expect(onChange).toHaveBeenCalledWith({ dateFrom: "", dateTo: "" });

		fireEvent.click(screen.getByRole("button", { name: "Este mês" }));
		expect(onChange).toHaveBeenLastCalledWith(getMonthRange());
	});

	it("supports custom preset selection", () => {
		const onChange = vi.fn();
		render(
			<PeriodShortcuts
				presets={["last6Months", "last12Months", "currentYear"]}
				dateFrom=""
				dateTo=""
				onChange={onChange}
			/>,
		);

		expect(screen.queryByRole("button", { name: "Todo período" })).toBeNull();
		expect(screen.getByRole("button", { name: "6 meses" })).toBeDefined();
		expect(screen.getByRole("button", { name: "12 meses" })).toBeDefined();
		expect(screen.getByRole("button", { name: "Este ano" })).toBeDefined();

		fireEvent.click(screen.getByRole("button", { name: "Este ano" }));
		expect(onChange).toHaveBeenCalledWith(getCurrentYearRange());
	});
});
