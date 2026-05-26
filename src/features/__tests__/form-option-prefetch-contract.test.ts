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
				routeFile: ["src", "routes", "_app", "clientes.tsx"],
				formFile: [
					"src",
					"features",
					"clients",
					"components",
					"form",
					"index.tsx",
				],
				requiredRouteSnippets: ["getClientTypesQueryOptions()"],
				requiredFormSnippets: ["useClientOptions()", "types"],
			},
			{
				routeFile: ["src", "routes", "_app", "colaboradores.tsx"],
				formFile: [
					"src",
					"features",
					"employees",
					"components",
					"form",
					"index.tsx",
				],
				requiredRouteSnippets: [
					"getEmployeeTypesQueryOptions()",
					"getEmployeeRolesQueryOptions()",
				],
				requiredFormSnippets: ["useEmployeeOptions()", "types", "roles"],
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
				routeFile: ["src", "routes", "_app", "honorarios.tsx"],
				formFile: [
					"src",
					"features",
					"fees",
					"components",
					"form",
					"index.tsx",
				],
				requiredRouteSnippets: [
					"getSelectableFeeContractsQueryOptions()",
					"getSelectableFeeRevenuesQueryOptions()",
				],
				requiredFormSnippets: ["useFeeOptions(", "contracts", "revenues"],
			},
			{
				routeFile: ["src", "routes", "_app", "index.tsx"],
				formFile: ["src", "routes", "_app", "index.tsx"],
				requiredRouteSnippets: [
					"getClientTypesQueryOptions()",
					"getSelectableContractClientsQueryOptions()",
					"getSelectableContractEmployeesQueryOptions()",
					"getContractLegalAreasQueryOptions()",
					"getContractStatusesQueryOptions()",
					"getContractAssignmentTypesQueryOptions()",
					"getContractRevenueTypesQueryOptions()",
					"getSelectableFeeContractsQueryOptions()",
					"getSelectableFeeRevenuesQueryOptions()",
					"getEmployeeTypesQueryOptions()",
					"getEmployeeRolesQueryOptions()",
				],
				requiredFormSnippets: [
					"<ClientForm state={state} onSuccess={state.close} />",
					"<ContractForm state={state} onSuccess={state.close} />",
					"<FeeForm state={state} onSuccess={state.close} />",
					"<EmployeeForm state={state} onSuccess={state.close} />",
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
