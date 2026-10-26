vi.mock("@/shared/session", () => ({
	useOptionalLoggedUserSession: () => null,
	hasPermission: () => false,
}));

// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EntityActions } from "../entity-actions";

afterEach(cleanup);

describe("EntityActions", () => {
	it("places the optional workspace action first and invokes it", () => {
		const open = vi.fn();
		render(<EntityActions onOpenPage={open} onView={vi.fn()} />);
		fireEvent.click(screen.getByRole("button", { name: "Ações" }));
		expect(screen.getAllByRole("menuitem")[0].textContent).toBe("Abrir página");
		fireEvent.click(screen.getByRole("menuitem", { name: "Abrir página" }));
		expect(open).toHaveBeenCalledOnce();
	});
	it("does not expose workspace navigation without read permission", () => {
		render(
			<EntityActions
				onOpenPage={vi.fn()}
				viewPermission="org:contracts:read_all"
			/>,
		);
		expect(screen.queryByRole("button", { name: "Ações" })).toBeNull();
	});
	it("renders ver resumo before editar in row actions menu", () => {
		render(<EntityActions onView={vi.fn()} canEdit onEdit={vi.fn()} />);

		fireEvent.click(screen.getByRole("button", { name: "Ações" }));

		const items = screen.getAllByRole("menuitem");

		expect(items[0]?.textContent).toContain("Ver resumo");
		expect(items[1]?.textContent).toContain("Editar");
	});
});
