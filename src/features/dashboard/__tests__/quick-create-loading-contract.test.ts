import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const workspaceRoot = process.cwd();

function readWorkspaceFile(...segments: string[]) {
	return readFileSync(join(workspaceRoot, ...segments), "utf8");
}

describe("dashboard quick-create loading contract", () => {
	it("keeps dashboard route loader scoped to dashboard summary only", () => {
		const routeContent = readWorkspaceFile(
			"src",
			"routes",
			"_app",
			"index.tsx",
		);

		expect(routeContent).toContain(
			"queryClient.ensureQueryData(getDashboardSummaryQueryOptions(search))",
		);
		expect(routeContent).not.toContain(
			"getDashboardEmployeeOptionsQueryOptions",
		);
		expect(routeContent).not.toContain("getContractLegalAreasQueryOptions");
		expect(routeContent).not.toContain("getContractRevenueTypesQueryOptions");
	});

	it("gives each quick-create form its own suspense fallback", () => {
		const formFiles = [
			["src", "features", "clients", "components", "form", "index.tsx"],
			["src", "features", "employees", "components", "form", "index.tsx"],
			["src", "features", "contracts", "components", "form", "index.tsx"],
			["src", "features", "fees", "components", "form", "index.tsx"],
		];

		for (const formFile of formFiles) {
			const content = readWorkspaceFile(...formFile);

			expect(content).toContain("Suspense");
			expect(content).toContain("fallback={<");
			expect(content).toContain("Skeleton");
			expect(content).toContain("<EntityForm");
		}
	});
});
