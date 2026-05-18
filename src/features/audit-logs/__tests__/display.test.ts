import { describe, expect, it } from "vitest";
import { getAuditDescription, getAuditEntityNameLabel } from "../utils/display";

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

	it("translates english entity-name prefixes to pt-BR labels", () => {
		expect(getAuditEntityNameLabel("Remuneration 594")).toBe("Remuneração 594");
		expect(getAuditEntityNameLabel("Fee 10")).toBe("Honorário 10");
	});
});
