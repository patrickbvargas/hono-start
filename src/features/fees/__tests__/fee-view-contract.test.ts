import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const feeListPath = "src/features/fees/components/list/index.tsx";
const feesRoutePath = "src/routes/_app/honorarios.tsx";

describe("Fee entity view composition contract", () => {
	it("keeps the feature card list separate from view-mode orchestration", () => {
		const listContent = readFileSync(feeListPath, "utf8");

		expect(listContent).toContain("import { DataCardList }");
		expect(listContent).not.toContain("useIsMobile");
		expect(listContent).not.toContain("useLocalStorage");
		expect(listContent).not.toContain("FeeTable");
	});

	it("keeps route composition on shared EntityView", () => {
		const routeContent = readFileSync(feesRoutePath, "utf8");

		expect(routeContent).toContain(
			'import { EntityView } from "@/shared/components/entity-view"',
		);
		expect(routeContent).toContain("<EntityView");
		expect(routeContent).toContain("list={");
		expect(routeContent).toContain("<FeeList");
		expect(routeContent).toContain("table={");
		expect(routeContent).toContain("<FeeTable");
	});
});
