// @vitest-environment jsdom

import { parseDate } from "@internationalized/date";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FinancialPeriodShortcuts } from "../financial-period-shortcuts";
import { DatePicker } from "../ui/date-picker";
import { DateRangePicker } from "../ui/date-range-picker";
import { InputNumber } from "../ui/input-number";

afterEach(cleanup);

function Example() {
	const [value, setValue] = useState(0);
	return (
		<InputNumber
			aria-label="Valor"
			value={value}
			onChange={setValue}
			minValue={0}
			step={0.01}
			formatOptions={{ style: "currency", currency: "BRL" }}
		/>
	);
}

describe("financial inputs", () => {
	it("applies a range only after both dates are selected and closes the calendar", async () => {
		vi.stubGlobal(
			"ResizeObserver",
			class {
				observe() {}
				unobserve() {}
				disconnect() {}
			},
		);
		const onChange = vi.fn();
		render(
			<FinancialPeriodShortcuts
				dateFrom="2026-10-01"
				dateTo="2026-10-31"
				onChange={onChange}
			/>,
		);
		const trigger = screen.getByRole("button", { name: "Personalizado" });
		fireEvent.click(trigger);
		fireEvent.click(
			await screen.findByRole("button", {
				name: /sábado, 10 de outubro de 2026/,
			}),
		);
		expect(onChange).not.toHaveBeenCalled();
		expect(trigger.getAttribute("aria-expanded")).toBe("true");
		fireEvent.click(
			screen.getByRole("button", {
				name: /terça-feira, 20 de outubro de 2026/,
			}),
		);
		expect(onChange).toHaveBeenCalledWith({
			dateFrom: "2026-10-10",
			dateTo: "2026-10-20",
		});
		await waitFor(() =>
			expect(trigger.getAttribute("aria-expanded")).toBe("false"),
		);
		vi.unstubAllGlobals();
	});

	it("clears both range boundaries together", async () => {
		vi.stubGlobal(
			"ResizeObserver",
			class {
				observe() {}
				unobserve() {}
				disconnect() {}
			},
		);
		const onChange = vi.fn();
		render(
			<DateRangePicker
				label="Período"
				dateFrom="2026-10-01"
				dateTo=""
				onChange={onChange}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Período" }));
		fireEvent.click(
			await screen.findByRole("button", { name: "Limpar período" }),
		);
		expect(onChange).toHaveBeenCalledWith({ dateFrom: "", dateTo: "" });
		vi.unstubAllGlobals();
	});
	it("uses Brazilian currency and preserves typed cents on blur", () => {
		render(<Example />);
		const input = screen.getByRole("textbox", {
			name: "Valor",
		}) as HTMLInputElement;
		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: "123,45" } });
		fireEvent.blur(input);
		expect(input.value.replaceAll("\u00a0", " ")).toBe("R$ 123,45");
	});

	it("closes the calendar after selecting a date and forwards the value", async () => {
		vi.stubGlobal(
			"ResizeObserver",
			class {
				observe() {}
				unobserve() {}
				disconnect() {}
			},
		);
		const onChange = vi.fn();
		render(
			<DatePicker
				aria-label="Data"
				defaultValue={parseDate("2026-10-23")}
				onChange={onChange}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Selecionar data" }));
		const date = await screen.findByRole("button", {
			name: /sábado, 24 de outubro de 2026/,
		});
		fireEvent.click(date);
		await waitFor(() =>
			expect(
				screen
					.getByRole("button", { name: "Selecionar data" })
					.getAttribute("aria-expanded"),
			).toBe("false"),
		);
		expect(onChange.mock.calls[0]?.[0].toString()).toBe("2026-10-24");
		vi.unstubAllGlobals();
	});
});
