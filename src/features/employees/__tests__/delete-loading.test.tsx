// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	read: vi.fn(() => {
		throw new Error("Delete confirmation must not fetch entity data");
	}),
	confirm: vi.fn(),
}));
vi.mock("../hooks/use-data", () => ({ useEmployee: mocks.read }));
vi.mock("../hooks/use-delete", () => ({
	useEmployeeDelete: () => ({ handleConfirm: mocks.confirm, isPending: false }),
}));

import { EmployeeDelete } from "../components/delete";

afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});
describe("Employee delete confirmation", () => {
	it("opens immediately without fetching entity data and deletes selected id", () => {
		render(
			<EmployeeDelete
				id={42}
				state={{ isOpen: true, onOpenChange: vi.fn(), close: vi.fn() }}
			/>,
		);
		expect(
			screen.getByRole("alertdialog", { name: "Excluir colaborador" }),
		).toBeTruthy();
		expect(screen.getByText("Tem certeza que deseja excluir?")).toBeTruthy();
		expect(mocks.read).not.toHaveBeenCalled();
		expect(mocks.confirm).not.toHaveBeenCalled();
		expect(
			screen.getByRole("button", { name: "Excluir" }).hasAttribute("disabled"),
		).toBe(false);
		fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
		expect(mocks.confirm).toHaveBeenCalledWith(42);
	});
	it("allows cancellation without deleting", () => {
		const onOpenChange = vi.fn();
		render(
			<EmployeeDelete
				id={42}
				state={{ isOpen: true, onOpenChange, close: vi.fn() }}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
		expect(onOpenChange.mock.calls[0]?.[0]).toBe(false);
		expect(mocks.confirm).not.toHaveBeenCalled();
	});
});
