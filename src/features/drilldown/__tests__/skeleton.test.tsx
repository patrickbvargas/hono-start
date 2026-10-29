// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { DrilldownSkeleton } from "../components/modal/skeleton";

afterEach(cleanup);

it("fills the table area with a single borderless placeholder", () => {
	render(<DrilldownSkeleton />);
	const status = screen.getByRole("status", { name: "Carregando detalhes" });
	expect(status.classList.contains("border")).toBe(false);
	expect(status.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(1);
});

it.each([1, 2] as const)("uses %i grouping blocks for overview", (blocks) => {
	render(<DrilldownSkeleton overview blocks={blocks} />);
	const status = screen.getByRole("status", { name: "Carregando detalhes" });
	expect(status.classList.contains("border")).toBe(false);
	expect(status.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(
		blocks * 11,
	);
});
