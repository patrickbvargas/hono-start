// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EntityActions } from "../entity-actions";

describe("EntityActions", () => {
	it("renders visualizar before editar in row actions menu", () => {
		render(<EntityActions onView={vi.fn()} canEdit onEdit={vi.fn()} />);

		fireEvent.click(screen.getByRole("button", { name: "Ações" }));

		const items = screen.getAllByRole("menuitem");

		expect(items[0]?.textContent).toContain("Visualizar");
		expect(items[1]?.textContent).toContain("Editar");
	});
});
