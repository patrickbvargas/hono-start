// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TableButton } from "../table-button";

afterEach(cleanup);
describe("TableButton", () => {
	it("activates the cell without triggering a row action or submitting a form", () => {
		const row = vi.fn(),
			click = vi.fn();
		render(
			<div onClick={row}>
				<TableButton onClick={click}>Detalhar</TableButton>
			</div>,
		);
		const button = screen.getByRole("button", { name: "Detalhar" });
		fireEvent.click(button);
		expect(click).toHaveBeenCalledOnce();
		expect(row).not.toHaveBeenCalled();
		expect(button.getAttribute("type")).toBe("button");
		expect(button.dataset.slot).toBe("table-button");
	});
	it("preserves disabled behavior", () => {
		const click = vi.fn();
		render(
			<TableButton disabled onClick={click}>
				Indisponível
			</TableButton>,
		);
		fireEvent.click(screen.getByRole("button"));
		expect(click).not.toHaveBeenCalled();
	});
});
