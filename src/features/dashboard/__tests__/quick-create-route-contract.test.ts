import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const route = readFileSync("src/routes/_app/visao-operacional.tsx", "utf8");
describe("dashboard current quick creation", () => {
	it("offers the operational forms and no obsolete settlement form", () => {
		for (const name of ["PersonForm", "ContractForm"])
			expect(route).toContain(
				`<${name} state={state} onSuccess={state.close} />`,
			);
		expect(route).not.toMatch(/FeeForm|feeOverlay|EmployeeForm|ClientForm/);
		expect(route).toContain('DropdownMenuContent align="end"');
	});
	it("gates creation and preloads the owning option queries", () => {
		for (const entity of ["contracts", "clients", "people"])
			expect(route).toContain(`hasPermission(session, "org:${entity}:create")`);
		for (const query of [
			"getPersonTypesQueryOptions",
			"getEmployeeTypesQueryOptions",
			"getContractLegalAreasQueryOptions",
			"getContractRevenueTypesQueryOptions",
		])
			expect(route).toContain(`${query}()`);
	});
});
