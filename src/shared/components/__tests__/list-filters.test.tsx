// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ListFilters } from "../list-filters";

describe("ListFilters", () => {
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
});
