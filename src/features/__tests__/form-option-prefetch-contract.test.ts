import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const workspaceRoot = process.cwd();

function readWorkspaceFile(...segments: string[]) {
	return readFileSync(join(workspaceRoot, ...segments), "utf8");
}

describe("form option prefetch contract", () => {
	it("keeps route loaders aligned with unconditional form option hooks", () => {
		const contracts = [
			{
				routeFile: ["src", "routes", "_app", "pessoas.tsx"],
				formFile: [
					"src",
					"features",
					"people",
					"components",
					"form",
					"index.tsx",
				],
				requiredRouteSnippets: [
					"getPersonTypesQueryOptions()",
					"getEmployeeTypesQueryOptions()",
				],
				requiredFormSnippets: ["usePersonOptions()", "types", "employeeTypes"],
			},
			{
				routeFile: ["src", "routes", "_app", "contratos.tsx"],
				formFile: [
					"src",
					"features",
					"contracts",
					"components",
					"form",
					"index.tsx",
				],
				requiredRouteSnippets: [
					"getSelectableContractClientsQueryOptions()",
					"getSelectableContractEmployeesQueryOptions()",
					"getContractLegalAreasQueryOptions()",
					"getContractStatusesQueryOptions()",
					"getContractAssignmentTypesQueryOptions()",
					"getContractRevenueTypesQueryOptions()",
				],
				requiredFormSnippets: [
					"useContractOptions()",
					"clients",
					"employees",
					"legalAreas",
					"statuses",
					"assignmentTypes",
					"revenueTypes",
				],
			},

			{
				routeFile: ["src", "routes", "_app", "visao-operacional.tsx"],
				formFile: ["src", "routes", "_app", "visao-operacional.tsx"],
				requiredRouteSnippets: [
					"getPersonTypesQueryOptions()",
					"getSelectableContractClientsQueryOptions()",
					"getSelectableContractEmployeesQueryOptions()",
					"getContractLegalAreasQueryOptions()",
					"getContractStatusesQueryOptions()",
					"getContractAssignmentTypesQueryOptions()",
					"getContractRevenueTypesQueryOptions()",
					"getEmployeeTypesQueryOptions()",
				],
				requiredFormSnippets: [
					"<PersonForm state={state} onSuccess={state.close} />",
					"<ContractForm state={state} onSuccess={state.close} />",
				],
			},
		];

		for (const contract of contracts) {
			const routeContent = readWorkspaceFile(...contract.routeFile);
			const formContent = readWorkspaceFile(...contract.formFile);

			for (const snippet of contract.requiredRouteSnippets) {
				expect(routeContent).toContain(snippet);
			}

			for (const snippet of contract.requiredFormSnippets) {
				expect(formContent).toContain(snippet);
			}
		}
	});
});
