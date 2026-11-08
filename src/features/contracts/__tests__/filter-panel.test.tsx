// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ status: "all" }));
vi.mock("@tanstack/react-router", () => ({ useLocation: () => undefined }));
vi.mock("@/shared/hooks/use-mobile", () => ({ useIsMobile: () => false }));
vi.mock("../hooks/use-data", () => ({
	useContractFilterOptions: () => ({
		clients: [],
		legalAreas: [],
		statuses: [],
		employees: [{ value: "3", label: "Bruna Farias" }],
	}),
}));
vi.mock("../hooks/use-filter", () => ({
	useContractFilter: () => {
		const defaultFilter = {
			query: "",
			clientId: "",
			employeeId: "",
			legalArea: [],
			contractStatus: [],
			active: "all",
			status: "active",
		};
		const field = ({ label }: { label?: string }) => <span>{label}</span>;
		return {
			filter: { ...defaultFilter, employeeId: "3", status: state.status },
			defaultFilter,
			canClearFilters: true,
			handleApplyFilter: vi.fn(),
			handleClearFilters: vi.fn(),
			form: {
				Form: ({ children }: { children: ReactNode }) => <div>{children}</div>,
				AppField: ({ children }: { children: (value: unknown) => ReactNode }) =>
					children({
						Autocomplete: field,
						CheckboxGroup: field,
						RadioGroup: field,
						Search: field,
					}),
			},
		};
	},
}));

import { ContractFilter } from "../components/filter";
import { useContractFilter } from "../hooks/use-filter";

function FilterHarness() {
	const controller = useContractFilter();
	return <ContractFilter controller={controller} />;
}

afterEach(cleanup);
describe("contract filter popover", () => {
	it("keeps linked filters applied while popover starts closed and opens manually", () => {
		state.status = "all";
		const { rerender } = render(<FilterHarness />);

		const filterBtn = screen.getByRole("button", { name: "Filtros" });
		expect(filterBtn.getAttribute("aria-expanded")).toBe("false");
		expect(screen.getByText("Bruna Farias")).toBeTruthy();

		fireEvent.click(filterBtn);
		expect(filterBtn.getAttribute("aria-expanded")).toBe("true");

		fireEvent.click(filterBtn);
		state.status = "deleted";
		rerender(<FilterHarness />);
		expect(filterBtn.getAttribute("aria-expanded")).toBe("false");
	});
});
