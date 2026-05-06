import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const workspaceRoot = process.cwd();

function readWorkspaceFile(...segments: string[]) {
	return readFileSync(join(workspaceRoot, ...segments), "utf8");
}

describe("remuneration route contract", () => {
	it("prefetches header options and avoids route-level pending skeletons across filter-heavy routes", () => {
		const routeContracts = [
			{
				file: ["src", "routes", "_app", "index.tsx"],
				requiredSnippets: [
					"Promise.all([",
					"getDashboardEmployeeOptionsQueryOptions()",
					"getContractLegalAreasQueryOptions()",
					"getContractRevenueTypesQueryOptions()",
				],
			},
			{
				file: ["src", "routes", "_app", "clientes.tsx"],
				requiredSnippets: ["Promise.all([", "getClientTypesQueryOptions()"],
			},
			{
				file: ["src", "routes", "_app", "colaboradores.tsx"],
				requiredSnippets: [
					"Promise.all([",
					"getEmployeeTypesQueryOptions()",
					"getEmployeeRolesQueryOptions()",
				],
			},
			{
				file: ["src", "routes", "_app", "contratos.tsx"],
				requiredSnippets: [
					"Promise.all([",
					"getSelectableContractClientsQueryOptions()",
					"getContractLegalAreasQueryOptions()",
					"getContractStatusesQueryOptions()",
				],
			},
			{
				file: ["src", "routes", "_app", "honorarios.tsx"],
				requiredSnippets: [
					"Promise.all([",
					"getSelectableFeeContractsQueryOptions()",
					"getSelectableFeeRevenuesQueryOptions()",
				],
			},
			{
				file: ["src", "routes", "_app", "remuneracoes.tsx"],
				requiredSnippets: [
					"Promise.all([",
					"getSelectableRemunerationContractsQueryOptions()",
					"getSelectableRemunerationEmployeesQueryOptions()",
				],
			},
			{
				file: ["src", "routes", "_app", "audit-log.tsx"],
				requiredSnippets: [
					"Promise.all([",
					"getAuditLogActionsQueryOptions()",
					"getAuditLogEntityTypesQueryOptions()",
					"getAuditLogActorsQueryOptions()",
				],
			},
		];

		for (const routeContract of routeContracts) {
			const routeContent = readWorkspaceFile(...routeContract.file);

			for (const requiredSnippet of routeContract.requiredSnippets) {
				expect(routeContent).toContain(requiredSnippet);
			}

			expect(routeContent).not.toContain("pendingComponent");
			expect(routeContent).not.toContain("ListRouteSkeleton");
			expect(routeContent).not.toContain("DashboardPendingSkeleton");
		}
	});
});
