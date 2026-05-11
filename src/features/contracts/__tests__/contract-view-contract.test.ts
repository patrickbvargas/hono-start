import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const contractListPath = "src/features/contracts/components/list/index.tsx";
const contractsRoutePath = "src/routes/_app/contratos.tsx";

describe("Contract entity view composition contract", () => {
	it("keeps the feature card list separate from view-mode orchestration", () => {
		const listContent = readFileSync(contractListPath, "utf8");

		expect(listContent).toContain("import { DataCardList }");
		expect(listContent).not.toContain("useIsMobile");
		expect(listContent).not.toContain("useLocalStorage");
		expect(listContent).not.toContain("ContractTable");
	});

	it("keeps route composition on shared EntityView and EntityViewToggle", () => {
		const routeContent = readFileSync(contractsRoutePath, "utf8");

		expect(routeContent).toContain(
			'import { EntityView } from "@/shared/components/entity-view"',
		);
		expect(routeContent).toContain("<EntityView.Toggle />");
		expect(routeContent).toContain("<EntityView");
		expect(routeContent).toContain("list={");
		expect(routeContent).toContain("<ContractList");
		expect(routeContent).toContain("table={");
		expect(routeContent).toContain("<ContractTable");
	});
});
