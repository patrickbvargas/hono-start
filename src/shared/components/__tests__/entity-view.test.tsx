// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EntityView } from "../entity-view";

beforeEach(() => {
	window.matchMedia = vi.fn().mockImplementation((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	}));
});

afterEach(cleanup);

describe("EntityView.Toggle", () => {
	it("renders table and cards toggle options with tooltips", () => {
		render(<EntityView.Toggle />);

		const tableBtn = screen.getByRole("button", { name: "Tabela" });
		const cardsBtn = screen.getByRole("button", { name: "Cards" });

		expect(tableBtn).not.toBeNull();
		expect(cardsBtn).not.toBeNull();
	});
});
