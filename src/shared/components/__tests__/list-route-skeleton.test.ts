import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const workspaceRoot = process.cwd();

function readWorkspaceFile(...segments: string[]) {
	return readFileSync(join(workspaceRoot, ...segments), "utf8");
}

describe("list-route skeleton contract", () => {
	it("keeps the shared skeleton aligned with the common route structure", () => {
		const content = readWorkspaceFile(
			"src",
			"shared",
			"components",
			"list-route-skeleton.tsx",
		);

		expect(content).toContain("Wrapper");
		expect(content).toContain("WrapperHeader");
		expect(content).toContain("WrapperBody");
		expect(content).toContain("showActions");
		expect(content).toContain("const rowKeys = Array.from(");
		expect(content).toContain("{ length: rowCount }");
		expect(content).toContain(
			'className="grid h-10 grid-cols-6 items-center gap-4 bg-sidebar px-4"',
		);
		expect(content).toContain(
			'className="grid min-h-10 grid-cols-6 items-center gap-4 px-4 py-2 last:flex-1"',
		);
		expect(content).not.toContain("border-input");
		expect(content).not.toContain("border-b");
		expect(content).not.toContain("border-t");
	});

	it("wires canonical list routes to immediate route-level pending skeletons", () => {
		const routeFiles = [
			["src", "routes", "_app", "clientes.tsx"],
			["src", "routes", "_app", "colaboradores.tsx"],
			["src", "routes", "_app", "contratos.tsx"],
			["src", "routes", "_app", "honorarios.tsx"],
			["src", "routes", "_app", "remuneracoes.tsx"],
			["src", "routes", "_app", "audit-log.tsx"],
		];

		for (const routeFile of routeFiles) {
			const content = readWorkspaceFile(...routeFile);

			expect(content).toContain("import { ListRouteSkeleton }");
			expect(content).toContain("pendingMs: 0");
			expect(content).toContain("pendingComponent: () =>");
			expect(content).toContain("<ListRouteSkeleton");
		}
	});
});
