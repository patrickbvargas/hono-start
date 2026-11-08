// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { InputNumber } from "@/shared/components/ui";

afterEach(cleanup);
it.each([
	["0", 0],
	["600", 600],
	["-1", -1],
])(
	"preserves invalid principal %s for validation instead of clamping",
	(text, expected) => {
		const changed = vi.fn();
		render(
			<InputNumber
				aria-label="Principal"
				defaultValue={500}
				maxValue={500}
				step={0.01}
				commitBehavior="validate"
				onChange={changed}
			/>,
		);
		const input = screen.getByRole("textbox", { name: "Principal" });
		fireEvent.change(input, { target: { value: text } });
		fireEvent.blur(input);
		expect(changed).toHaveBeenLastCalledWith(expected);
	},
);
