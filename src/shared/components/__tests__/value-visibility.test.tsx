// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createPortal } from "react-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	SensitiveValue,
	ValueVisibilityProvider,
	ValueVisibilityToggle,
} from "../value-visibility";

afterEach(() => {
	cleanup();
	window.localStorage.clear();
	vi.restoreAllMocks();
});

function Example() {
	return (
		<ValueVisibilityProvider>
			<ValueVisibilityToggle />
			<SensitiveValue>R$ 1.234,56</SensitiveValue>
			{createPortal(<SensitiveValue>R$ 987,65</SensitiveValue>, document.body)}
		</ValueVisibilityProvider>
	);
}

describe("value visibility", () => {
	it("hides values across the page and portals, persists and restores the preference", () => {
		const view = render(<Example />);
		expect(screen.getByText("R$ 1.234,56")).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "Ocultar valores" }));
		expect(screen.queryByText("R$ 1.234,56")).toBeNull();
		expect(screen.queryByText("R$ 987,65")).toBeNull();
		expect(screen.getAllByText("Valor oculto")).toHaveLength(2);
		expect(screen.getAllByText("R$ •••")).toHaveLength(2);
		expect(window.localStorage.getItem("values.hidden")).toBe("true");
		view.unmount();
		render(<Example />);
		expect(screen.queryByText("R$ 1.234,56")).toBeNull();
		const toggle = screen.getByRole("button", { name: "Mostrar valores" });
		expect(toggle.getAttribute("aria-pressed")).toBe("true");
		fireEvent.click(toggle);
		expect(screen.getByText("R$ 1.234,56")).toBeTruthy();
		expect(screen.getByText("R$ 987,65")).toBeTruthy();
		expect(window.localStorage.getItem("values.hidden")).toBe("false");
	});

	it("keeps the toggle usable when browser storage is unavailable", () => {
		vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
			throw new Error("Unavailable");
		});
		vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
			throw new Error("Unavailable");
		});
		render(<Example />);
		fireEvent.click(screen.getByRole("button", { name: "Mostrar valores" }));
		expect(screen.getByText("R$ 1.234,56")).toBeTruthy();
	});
});
