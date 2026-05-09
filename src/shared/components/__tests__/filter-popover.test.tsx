// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FilterPopover } from "../filter-popover";

describe("FilterPopover", () => {
	it("renders active indicator only when explicitly enabled and active", () => {
		const { rerender, container } = render(
			<FilterPopover>
				<div>Conteúdo</div>
			</FilterPopover>,
		);

		expect(
			container.querySelector('[data-slot="filter-popover-indicator"]'),
		).toBeNull();

		rerender(
			<FilterPopover showActiveIndicator>
				<div>Conteúdo</div>
			</FilterPopover>,
		);

		expect(
			container.querySelector('[data-slot="filter-popover-indicator"]'),
		).toBeNull();

		rerender(
			<FilterPopover showActiveIndicator hasActiveIndicator>
				<div>Conteúdo</div>
			</FilterPopover>,
		);

		expect(screen.getByRole("button", { name: "Filtros" })).not.toBeNull();
		expect(
			container.querySelector('[data-slot="filter-popover-indicator"]'),
		).not.toBeNull();
	});
});
