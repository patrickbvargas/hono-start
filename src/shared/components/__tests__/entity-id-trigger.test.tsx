// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EntityIdTrigger } from "../entity-id-trigger";

describe("EntityIdTrigger", () => {
	it("opens the selected record from its human-readable name", () => {
		const onView = vi.fn();
		render(
			<EntityIdTrigger id={99} label="Processo de teste" onView={onView} />,
		);
		fireEvent.click(
			screen.getByRole("button", { name: "Ver detalhes de Processo de teste" }),
		);
		expect(onView).toHaveBeenCalledWith(99);
	});
	it("renders the formatted id and opens details with the same id", () => {
		const onView = vi.fn();

		render(<EntityIdTrigger id={12} onView={onView} />);

		const trigger = screen.getByRole("button", {
			name: "Ver detalhes do registro #12",
		});

		expect(trigger.textContent).toBe("#12");

		fireEvent.click(trigger);

		expect(onView).toHaveBeenCalledWith(12);
	});
});
