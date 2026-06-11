// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
	EntityDeleteConfirm,
	EntityRestoreConfirm,
} from "../entity-confirmation";

const OPEN_STATE = {
	isOpen: true,
	onOpenChange: vi.fn(),
	close: vi.fn(),
};

describe("Entity confirmations", () => {
	it("keeps excluir label while showing spinner during pending delete", () => {
		render(
			<EntityDeleteConfirm
				state={OPEN_STATE}
				title="Excluir cliente"
				description="Tem certeza?"
				onConfirm={vi.fn()}
				isPending
			/>,
		);

		const button = screen.getByRole("button", { name: "Excluir" });

		expect(button.hasAttribute("disabled")).toBe(true);
		expect(button.textContent).toContain("Excluir");
		expect(button.querySelector("svg")).not.toBeNull();
	});

	it("keeps restaurar label while showing spinner during pending restore", () => {
		render(
			<EntityRestoreConfirm
				state={OPEN_STATE}
				title="Restaurar cliente"
				description="Tem certeza?"
				onConfirm={vi.fn()}
				isPending
			/>,
		);

		const button = screen.getByRole("button", { name: "Restaurar" });

		expect(button.hasAttribute("disabled")).toBe(true);
		expect(button.textContent).toContain("Restaurar");
		expect(button.querySelector("svg")).not.toBeNull();
	});
});
