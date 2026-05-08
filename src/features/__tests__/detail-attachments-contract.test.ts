import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const workspaceRoot = process.cwd();

function readWorkspaceFile(...segments: string[]) {
	return readFileSync(join(workspaceRoot, ...segments), "utf8");
}

describe("detail attachment composition contract", () => {
	it("keeps attachment sections embedded in supported detail drawers and fallbacks", () => {
		const detailFiles = [
			["src", "features", "clients", "components", "details", "index.tsx"],
			["src", "features", "contracts", "components", "details", "index.tsx"],
			["src", "features", "employees", "components", "details", "index.tsx"],
		];

		for (const file of detailFiles) {
			const content = readWorkspaceFile(...file);

			expect(content).toContain('EntityDetail.Section title="Anexos"');
			expect(content).toContain("<AttachmentSection");
			expect(content).toContain("const ");
			expect(content).toContain("idPlaceholder");
		}
	});
});
