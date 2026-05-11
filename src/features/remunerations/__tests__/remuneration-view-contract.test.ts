import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const remunerationListPath =
	"src/features/remunerations/components/list/index.tsx";
const remunerationsRoutePath = "src/routes/_app/remuneracoes.tsx";

describe("Remuneration entity view composition contract", () => {
	it("keeps the feature card list separate from view-mode orchestration", () => {
		const listContent = readFileSync(remunerationListPath, "utf8");

		expect(listContent).toContain("import { DataCardList }");
		expect(listContent).not.toContain("useIsMobile");
		expect(listContent).not.toContain("useLocalStorage");
		expect(listContent).not.toContain("RemunerationTable");
	});

	it("keeps route composition on shared EntityView and EntityViewToggle", () => {
		const routeContent = readFileSync(remunerationsRoutePath, "utf8");

		expect(routeContent).toContain(
			'import { EntityView } from "@/shared/components/entity-view"',
		);
		expect(routeContent).toContain("<EntityView.Toggle />");
		expect(routeContent).toContain("<EntityView");
		expect(routeContent).toContain("list={");
		expect(routeContent).toContain("<RemunerationList");
		expect(routeContent).toContain("table={");
		expect(routeContent).toContain("<RemunerationTable");
	});
});
