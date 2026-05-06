import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const workspaceRoot = process.cwd();

function readWorkspaceFile(...segments: string[]) {
	return readFileSync(join(workspaceRoot, ...segments), "utf8");
}

describe("dashboard pending route contract", () => {
	it("keeps a dedicated dashboard skeleton wired to the root route pending state", () => {
		const routeContent = readWorkspaceFile(
			"src",
			"routes",
			"_app",
			"index.tsx",
		);

		expect(routeContent).toContain("DashboardPendingSkeleton");
		expect(routeContent).toContain("pendingMs: 0");
		expect(routeContent).toContain(
			"pendingComponent: () => <DashboardPendingSkeleton />",
		);
	});

	it("keeps the dashboard skeleton aligned to wrapper and analytical surfaces", () => {
		const skeletonContent = readWorkspaceFile(
			"src",
			"features",
			"dashboard",
			"components",
			"pending-skeleton",
			"index.tsx",
		);

		expect(skeletonContent).toContain("Wrapper");
		expect(skeletonContent).toContain("WrapperHeader");
		expect(skeletonContent).toContain("WrapperBody");
		expect(skeletonContent).toContain("ScrollArea");
		expect(skeletonContent).toContain("dashboard-pending-metrics");
		expect(skeletonContent).toContain("dashboard-pending-financial-evolution");
		expect(skeletonContent).toContain("dashboard-pending-remuneration-table");
		expect(skeletonContent).toContain("dashboard-pending-breakdowns");
		expect(skeletonContent).toContain(
			'className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"',
		);
		expect(skeletonContent).toContain('className="grid gap-3 xl:grid-cols-2"');
	});
});
