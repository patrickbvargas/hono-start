import { describe, expect, it } from "vitest";
import { getAuditDescription } from "../utils/display";

describe("audit-log display helpers", () => {
	it("uses system wording instead of generic registro for system events", () => {
		expect(
			getAuditDescription({
				action: "UPDATE",
				entityType: "",
				entityName: "",
				changeData: null,
				fallbackDescription: "",
			}),
		).toBe("atualizou sistema.");
	});

	it("keeps special system actions concise", () => {
		expect(
			getAuditDescription({
				action: "UPDATE",
				entityType: "",
				entityName: "",
				changeData: { action: "GRANT_ACCESS" },
				fallbackDescription: "",
			}),
		).toBe("liberou acesso ao sistema.");
	});

	it("preserves generic registro fallback for non-system unnamed entities", () => {
		expect(
			getAuditDescription({
				action: "UPDATE",
				entityType: "Contract",
				entityName: "",
				changeData: null,
				fallbackDescription: "",
			}),
		).toBe("atualizou contrato registro.");
	});
});
