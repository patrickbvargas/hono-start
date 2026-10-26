// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EntityIdTrigger } from "../entity-id-trigger";

describe("EntityIdTrigger", () => {
	it("prefers page navigation while preserving contextual drawer fallback", () => {
		const onOpenPage = vi.fn();
		const onView = vi.fn();
		render(
			<EntityIdTrigger
				id={42}
				label="Maria"
				onOpenPage={onOpenPage}
				onView={onView}
			/>,
		);
		fireEvent.click(
			screen.getByRole("button", { name: "Abrir página de Maria" }),
		);
		expect(
			screen
				.getByRole("button", { name: "Abrir página de Maria" })
				.querySelector("svg[aria-hidden=true]"),
		).toBeNull();
		expect(onOpenPage).toHaveBeenCalledWith(42);
		expect(onView).not.toHaveBeenCalled();
	});
	it("opens the selected record from its human-readable name", () => {
		const onView = vi.fn();
		render(
			<EntityIdTrigger id={99} label="Processo de teste" onView={onView} />,
		);
		fireEvent.click(
			screen.getByRole("button", { name: "Ver resumo de Processo de teste" }),
		);
		expect(onView).toHaveBeenCalledWith(99);
	});
	it("renders the formatted id and opens details with the same id", () => {
		const onView = vi.fn();

		render(<EntityIdTrigger id={12} onView={onView} />);

		const trigger = screen.getByRole("button", {
			name: "Ver resumo do registro #12",
		});

		expect(trigger.textContent).toBe("#12");
		expect(trigger.querySelector("svg")).toBeNull();

		fireEvent.click(trigger);

		expect(onView).toHaveBeenCalledWith(12);
	});
});
