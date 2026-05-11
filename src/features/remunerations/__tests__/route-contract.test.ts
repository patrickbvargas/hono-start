import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const workspaceRoot = process.cwd();

function readWorkspaceFile(...segments: string[]) {
	return readFileSync(join(workspaceRoot, ...segments), "utf8");
}

describe("route prefetch and loading checklist", () => {
	it("keeps list routes aligned with RouteLoading and first-render suspense hooks", () => {
		const routeContracts = [
			{
				file: ["src", "routes", "_app", "index.tsx"],
				filterFile: [
					"src",
					"features",
					"dashboard",
					"components",
					"filter",
					"index.tsx",
				],
				requiredRouteSnippets: [
					"Promise.all([",
					"<RouteLoading />",
					"queryClient.ensureQueryData(getDashboardSummaryQueryOptions(search))",
					"getDashboardEmployeeOptionsQueryOptions()",
					"getContractLegalAreasQueryOptions()",
					"getContractRevenueTypesQueryOptions()",
				],
				requiredFilterSnippets: [
					"useDashboardOptions()",
					"employees",
					"legalAreas",
					"revenueTypes",
				],
			},
			{
				file: ["src", "routes", "_app", "clientes.tsx"],
				filterFile: [
					"src",
					"features",
					"clients",
					"components",
					"filter",
					"index.tsx",
				],
				requiredRouteSnippets: [
					"Promise.all([",
					"<RouteLoading />",
					"queryClient.ensureQueryData(getClientsQueryOptions(search))",
					"getClientTypesQueryOptions()",
				],
				requiredFilterSnippets: ["useClientOptions()", "types"],
			},
			{
				file: ["src", "routes", "_app", "colaboradores.tsx"],
				filterFile: [
					"src",
					"features",
					"employees",
					"components",
					"filter",
					"index.tsx",
				],
				requiredRouteSnippets: [
					"Promise.all([",
					"<RouteLoading />",
					"queryClient.ensureQueryData(getEmployeesQueryOptions(search))",
					"getEmployeeTypesQueryOptions()",
					"getEmployeeRolesQueryOptions()",
				],
				requiredFilterSnippets: ["useEmployeeOptions()", "types", "roles"],
			},
			{
				file: ["src", "routes", "_app", "contratos.tsx"],
				filterFile: [
					"src",
					"features",
					"contracts",
					"components",
					"filter",
					"index.tsx",
				],
				requiredRouteSnippets: [
					"Promise.all([",
					"<RouteLoading />",
					"queryClient.ensureQueryData(getContractsQueryOptions(search))",
					"getSelectableContractClientsQueryOptions()",
					"getContractLegalAreasQueryOptions()",
					"getContractStatusesQueryOptions()",
				],
				requiredFilterSnippets: [
					"useContractFilterOptions()",
					"clients",
					"legalAreas",
					"statuses",
				],
			},
			{
				file: ["src", "routes", "_app", "honorarios.tsx"],
				filterFile: [
					"src",
					"features",
					"fees",
					"components",
					"filter",
					"index.tsx",
				],
				requiredRouteSnippets: [
					"Promise.all([",
					"<RouteLoading />",
					"queryClient.ensureQueryData(getFeesQueryOptions(search))",
					"getSelectableFeeContractsQueryOptions()",
					"getSelectableFeeRevenuesQueryOptions()",
				],
				requiredFilterSnippets: ["useFeeOptions()", "contracts", "revenues"],
			},
			{
				file: ["src", "routes", "_app", "remuneracoes.tsx"],
				filterFile: [
					"src",
					"features",
					"remunerations",
					"components",
					"filter",
					"index.tsx",
				],
				requiredRouteSnippets: [
					"Promise.all([",
					"<RouteLoading />",
					"queryClient.ensureQueryData(getRemunerationsQueryOptions(search))",
					"getSelectableRemunerationContractsQueryOptions()",
					"getSelectableRemunerationEmployeesQueryOptions()",
				],
				requiredFilterSnippets: [
					"useRemunerationOptions()",
					"contracts",
					"employees",
				],
			},
			{
				file: ["src", "routes", "_app", "auditoria.tsx"],
				filterFile: [
					"src",
					"features",
					"audit-logs",
					"components",
					"filter",
					"index.tsx",
				],
				requiredRouteSnippets: [
					"Promise.all([",
					"<RouteLoading />",
					"queryClient.ensureQueryData(getAuditLogsQueryOptions(search))",
					"getAuditLogActionsQueryOptions()",
					"getAuditLogEntityTypesQueryOptions()",
					"getAuditLogActorsQueryOptions()",
				],
				requiredFilterSnippets: [
					"useAuditLogOptions()",
					"actions",
					"entityTypes",
					"actors",
				],
			},
		];

		for (const routeContract of routeContracts) {
			const routeContent = readWorkspaceFile(...routeContract.file);
			const filterContent = readWorkspaceFile(...routeContract.filterFile);

			for (const requiredSnippet of routeContract.requiredRouteSnippets) {
				expect(routeContent).toContain(requiredSnippet);
			}

			for (const requiredSnippet of routeContract.requiredFilterSnippets) {
				expect(filterContent).toContain(requiredSnippet);
			}

			expect(routeContent).not.toContain("pendingComponent");
			expect(routeContent).not.toContain("pendingMs");
			expect(routeContent).not.toContain("ListRouteSkeleton");
			expect(routeContent).not.toContain("DashboardPendingSkeleton");
		}
	});
});
