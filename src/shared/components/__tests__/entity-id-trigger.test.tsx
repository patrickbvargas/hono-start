// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EntityIdTrigger } from "../entity-id-trigger";

afterEach(cleanup);
describe("table record navigation", () => {
	it("keeps IDs muted and noninteractive even with handlers", () => {
		render(<EntityIdTrigger id={42} onOpenPage={vi.fn()} onView={vi.fn()} />);
		expect(screen.queryByRole("button")).toBeNull();
		expect(screen.getByText("#42").className).toContain(
			"text-muted-foreground",
		);
	});
	it("opens page from name and never opens summary", () => {
		const open = vi.fn(),
			view = vi.fn();
		render(
			<EntityIdTrigger id={42} label="Maria" onOpenPage={open} onView={view} />,
		);
		const trigger = screen.getByRole("button", {
			name: "Abrir página de Maria",
		});
		expect(trigger.querySelector("svg[aria-hidden=true]")).not.toBeNull();
		fireEvent.click(trigger);
		expect(open).toHaveBeenCalledWith(42);
		expect(view).not.toHaveBeenCalled();
	});
	it("keeps names plain when page navigation unavailable", () => {
		render(<EntityIdTrigger id={42} label="Maria" onView={vi.fn()} />);
		expect(screen.queryByRole("button")).toBeNull();
		expect(screen.getByText("Maria")).toBeTruthy();
	});
});
