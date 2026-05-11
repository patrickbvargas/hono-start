import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const clientListPath = "src/features/clients/components/list/index.tsx";
const clientsRoutePath = "src/routes/_app/clientes.tsx";
const sharedEntityViewPath = "src/shared/components/entity-view.tsx";
const sharedEntityViewHookPath = "src/shared/hooks/use-entity-view-mode.ts";
const sharedLocalStorageHookPath = "src/shared/hooks/use-local-storage.ts";

describe("Client entity view composition contract", () => {
	it("keeps the feature card list separate from view-mode orchestration", () => {
		const listContent = readFileSync(clientListPath, "utf8");

		expect(listContent).toContain("import { DataCardList }");
		expect(listContent).not.toContain("useIsMobile");
		expect(listContent).not.toContain("useLocalStorage");
		expect(listContent).not.toContain("ClientTable");
	});

	it("keeps route composition on shared EntityView and EntityViewToggle", () => {
		const routeContent = readFileSync(clientsRoutePath, "utf8");

		expect(routeContent).toContain(
			'import { EntityView } from "@/shared/components/entity-view"',
		);
		expect(routeContent).toContain("<EntityView.Toggle />");
		expect(routeContent).toContain("<EntityView");
		expect(routeContent).toContain("list={");
		expect(routeContent).toContain("<ClientList");
		expect(routeContent).toContain("table={");
		expect(routeContent).toContain("<ClientTable");
	});

	it("keeps shared entity-view mode state reusable and storage-backed", () => {
		const hookContent = readFileSync(sharedEntityViewHookPath, "utf8");
		const viewContent = readFileSync(sharedEntityViewPath, "utf8");
		const localStorageHookContent = readFileSync(
			sharedLocalStorageHookPath,
			"utf8",
		);

		expect(hookContent).toContain(
			'export type EntityViewMode = "table" | "list"',
		);
		expect(hookContent).toContain(
			'export const DEFAULT_ENTITY_VIEW_MODE_STORAGE_KEY = "entity.viewMode"',
		);
		expect(hookContent).toContain(
			'const ENTITY_VIEW_MODE_CHANGE_EVENT = "entity-view-mode-change"',
		);
		expect(hookContent).toContain("useIsMobile");
		expect(hookContent).toContain("window.localStorage.setItem");
		expect(hookContent).toContain("new CustomEvent");
		expect(hookContent).toContain(
			'window.addEventListener("storage", handleStorageChange)',
		);
		expect(viewContent).toContain("storageKey?: string");
		expect(viewContent).toContain("Toggle: EntityViewToggle");
		expect(viewContent).toContain(
			"extends React.ComponentPropsWithoutRef<typeof ButtonGroup>",
		);
		expect(viewContent).toContain(
			'className={cn(activeViewMode !== "table" && "text-muted-foreground")}',
		);
		expect(viewContent).toContain('activeViewMode === "list" ? list : table');
		expect(viewContent).toContain('setPreferredViewMode("table")');
		expect(viewContent).toContain('setPreferredViewMode("list")');
		expect(localStorageHookContent).not.toContain("new CustomEvent");
		expect(localStorageHookContent).not.toContain("addEventListener");
	});
});
