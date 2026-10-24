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

afterEach(cleanup);
describe("advanced contract filters", () => {
	it("keeps linked filters applied while panel starts closed and only opens manually", () => {
		state.status = "all";
		const { rerender } = render(<ContractFilter />);

		expect(
			screen
				.getByRole("button", { name: "Mais filtros" })
				.getAttribute("aria-expanded"),
		).toBe("false");
		expect(screen.getByText("Bruna Farias")).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "Mais filtros" }));
		expect(
			screen
				.getByRole("button", { name: "Mais filtros" })
				.getAttribute("aria-expanded"),
		).toBe("true");
		fireEvent.click(screen.getByRole("button", { name: "Mais filtros" }));
		state.status = "deleted";
		rerender(<ContractFilter />);
		expect(
			screen
				.getByRole("button", { name: "Mais filtros" })
				.getAttribute("aria-expanded"),
		).toBe("false");
	});
});
