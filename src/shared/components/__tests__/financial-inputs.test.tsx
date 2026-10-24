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
import { DatePicker } from "../ui/date-picker";
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
