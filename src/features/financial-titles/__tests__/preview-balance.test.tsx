// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { PreviewBalance } from "../components/revenue-generation/preview-balance";

afterEach(cleanup);

it("switches from amber to green when the exact cents close", () => {
	const { rerender } = render(
		<PreviewBalance titles={[]} negotiatedAmount={1000} />,
	);
	expect(screen.getByRole("status").textContent).toContain("Ajuste necessário");
	expect(screen.getByRole("status").className).toContain("bg-amber-500/10");
	rerender(
		<PreviewBalance
			titles={[{ amount: 333.34 }, { amount: 333.33 }, { amount: 333.33 }]}
			negotiatedAmount={1000}
		/>,
	);
	expect(screen.getByRole("status").textContent).toContain("Valores conferem");
	expect(screen.getByRole("status").className).toContain("bg-green-600/10");
});

it.each([999.99, 1000.01])(
	"warns when preview is above or below negotiated value: %s",
	(amount) => {
		render(<PreviewBalance titles={[{ amount }]} negotiatedAmount={1000} />);
		expect(screen.getByRole("status").textContent).toContain(
			"Ajuste necessário",
		);
	},
);

it.each([Number.NaN, 1000.001, -1])(
	"never marks invalid amounts as balanced: %s",
	(amount) => {
		render(<PreviewBalance titles={[{ amount }]} negotiatedAmount={1000} />);
		expect(screen.getByRole("status").textContent).toContain(
			"Revise os valores",
		);
		expect(screen.getByRole("status").className).toContain("bg-amber-500/10");
	},
);
