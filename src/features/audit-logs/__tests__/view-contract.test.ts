import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const auditLogListPath = "src/features/audit-logs/components/list/index.tsx";
const auditLogRoutePath = "src/routes/_app/auditoria.tsx";

describe("Audit log entity view composition contract", () => {
	it("keeps the feature card list separate from view-mode orchestration", () => {
		const listContent = readFileSync(auditLogListPath, "utf8");

		expect(listContent).toContain("import { DataCardList }");
		expect(listContent).not.toContain("useIsMobile");
		expect(listContent).not.toContain("useLocalStorage");
		expect(listContent).not.toContain("AuditLogTable");
	});

	it("keeps route composition on shared EntityView and EntityViewToggle", () => {
		const routeContent = readFileSync(auditLogRoutePath, "utf8");

		expect(routeContent).toContain(
			'import { EntityView } from "@/shared/components/entity-view"',
		);
		expect(routeContent).toContain("<EntityView.Toggle />");
		expect(routeContent).toContain("<EntityView");
		expect(routeContent).toContain("list={");
		expect(routeContent).toContain("<AuditLogList");
		expect(routeContent).toContain("table={");
		expect(routeContent).toContain("<AuditLogTable");
	});
});
