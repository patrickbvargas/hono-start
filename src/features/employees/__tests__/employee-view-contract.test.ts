import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const employeeListPath = "src/features/employees/components/list/index.tsx";
const employeesRoutePath = "src/routes/_app/colaboradores.tsx";

describe("Employee entity view composition contract", () => {
	it("keeps the feature card list separate from view-mode orchestration", () => {
		const listContent = readFileSync(employeeListPath, "utf8");

		expect(listContent).toContain("import { DataCardList }");
		expect(listContent).not.toContain("useIsMobile");
		expect(listContent).not.toContain("useLocalStorage");
		expect(listContent).not.toContain("EmployeeTable");
	});

	it("keeps route composition on shared EntityView and EntityViewToggle", () => {
		const routeContent = readFileSync(employeesRoutePath, "utf8");

		expect(routeContent).toContain(
			'import { EntityView } from "@/shared/components/entity-view"',
		);
		expect(routeContent).toContain("<EntityView.Toggle />");
		expect(routeContent).toContain("<EntityView");
		expect(routeContent).toContain("list={");
		expect(routeContent).toContain("<EmployeeList");
		expect(routeContent).toContain("table={");
		expect(routeContent).toContain("<EmployeeTable");
	});
});
