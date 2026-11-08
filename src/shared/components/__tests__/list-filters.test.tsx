// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ListFilters } from "../list-filters";

afterEach(cleanup);

describe("ListFilters", () => {
	it("bounds both mobile scroll regions while preserving the close footer", async () => {
		render(
			<ListFilters.Drawer label="Filtros">
				<div>Campos extensos</div>
			</ListFilters.Drawer>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Filtros" }));
		const dialog = await screen.findByRole("dialog");
		expect(
			dialog.querySelector('[data-slot="scroll-area"]')?.className,
		).toContain("max-h-[calc(80dvh-10rem)]");
		expect(
			dialog.querySelector('[data-slot="scroll-area"]')?.className,
		).toContain(
			"[&>[data-slot=scroll-area-viewport]]:max-h-[calc(80dvh-10rem)]",
		);
		expect(
			dialog.querySelector('[data-slot="drawer-footer"]')?.className,
		).toContain("shrink-0");
		fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
	});
	it("hides empty direct children to avoid layout gaps", () => {
		const { container } = render(<ListFilters />);

		expect(container.firstElementChild?.className).toContain(
			"[&>*:empty]:hidden",
		);
	});
	it("keeps the mobile filter trigger icon-only and accessible", () => {
		render(
			<ListFilters.Popover label="Mais filtros" title="Filtros" iconOnly>
				<div>Campos</div>
			</ListFilters.Popover>,
		);
		const trigger = screen.getByRole("button", { name: "Mais filtros" });
		expect(trigger.textContent).toBe("");
		expect(trigger.querySelector("svg")).not.toBeNull();
	});
	it("renders active filter count badge on popover trigger when activeCount > 0", () => {
		render(
			<ListFilters.Popover label="Filtros" title="Filtros" activeCount={3}>
				<div>Campos</div>
			</ListFilters.Popover>,
		);
		const trigger = screen.getByRole("button", { name: "Filtros" });
		expect(trigger.textContent).toContain("3");
	});
});
