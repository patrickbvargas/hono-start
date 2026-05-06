import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const workspaceRoot = process.cwd();

function readWorkspaceFile(...segments: string[]) {
	return readFileSync(join(workspaceRoot, ...segments), "utf8");
}

describe("dashboard quick-create route contract", () => {
	it("wires a Novo dropdown action in the dashboard header", () => {
		const routeContent = readWorkspaceFile(
			"src",
			"routes",
			"_app",
			"index.tsx",
		);

		expect(routeContent).toContain("DropdownMenu");
		expect(routeContent).toContain("DropdownMenuTrigger");
		expect(routeContent).toContain('DropdownMenuContent align="end"');
		expect(routeContent).toContain("Novo");
		expect(routeContent).toContain("Cliente");
		expect(routeContent).toContain("Contrato");
		expect(routeContent).toContain("Honorário");
		expect(routeContent).toContain("Colaborador");
	});

	it("keeps quick-create overlays route-local and reuses existing forms", () => {
		const routeContent = readWorkspaceFile(
			"src",
			"routes",
			"_app",
			"index.tsx",
		);

		expect(routeContent).toContain(
			"const clientOverlay = useOverlay<EntityId>()",
		);
		expect(routeContent).toContain(
			"const contractOverlay = useOverlay<EntityId>()",
		);
		expect(routeContent).toContain("const feeOverlay = useOverlay<EntityId>()");
		expect(routeContent).toContain(
			"const employeeOverlay = useOverlay<EntityId>()",
		);
		expect(routeContent).toContain(
			"<ClientForm state={state} onSuccess={state.close} />",
		);
		expect(routeContent).toContain(
			"<ContractForm state={state} onSuccess={state.close} />",
		);
		expect(routeContent).toContain(
			"<FeeForm state={state} onSuccess={state.close} />",
		);
		expect(routeContent).toContain(
			"<EmployeeForm state={state} onSuccess={state.close} />",
		);
	});

	it("keeps collaborator quick-create gated by administrator visibility", () => {
		const routeContent = readWorkspaceFile(
			"src",
			"routes",
			"_app",
			"index.tsx",
		);

		expect(routeContent).toContain("{isAdmin ? (");
		expect(routeContent).toContain("employeeOverlay.overlay.create.open()");
	});
});
