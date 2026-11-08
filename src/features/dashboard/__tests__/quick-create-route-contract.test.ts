import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const route = readFileSync("src/routes/_app/index.tsx", "utf8");
describe("dashboard current quick creation", () => {
	it("offers the operational forms and no obsolete settlement form", () => {
		for (const name of ["PersonForm", "ContractForm", "ExpenseForm"])
			expect(route).toContain(
				`<${name} state={state} onSuccess={state.close} />`,
			);
		expect(route).not.toMatch(/FeeForm|feeOverlay|EmployeeForm|ClientForm/);
		expect(route).toContain('DropdownMenuContent align="end"');
	});
	it("gates creation and preloads the owning option queries", () => {
		for (const entity of ["contracts", "clients", "people", "expenses"])
			expect(route).toContain(`hasPermission(session, "org:${entity}:create")`);
		for (const query of [
			"getPersonTypesQueryOptions",
			"getEmployeeTypesQueryOptions",
			"getContractLegalAreasQueryOptions",
			"getContractRevenueTypesQueryOptions",
			"getExpenseCategoriesQueryOptions",
		])
			expect(route).toContain(`${query}()`);
	});
});
