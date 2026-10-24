import { describe, expect, it } from "vitest";
import {
	getAuditDescription,
	getAuditEntityNameLabel,
	getAuditLogTitle,
} from "../utils/display";

describe("audit-log display helpers", () => {
	it("localizes historical expense and installment names without changing their identity", () => {
		expect(getAuditEntityNameLabel("Expense #121")).toBe("Despesa #121");
		expect(getAuditEntityNameLabel("Installment 1", "131")).toBe(
			"Honorário #131 · Parcela 1",
		);
		expect(
			getAuditDescription({
				action: "CREATE",
				entityType: "Fee",
				entityId: "131",
				entityName: "Installment 1",
				changeData: null,
				fallbackDescription: "",
			}),
		).toBe("criou honorário #131 · Parcela 1.");
	});
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

describe("audit log titles", () => {
	it("uses action labels and falls back from entity name to type and system", () => {
		expect(
			getAuditLogTitle({
				action: "CREATE",
				entityName: "Maria",
				entityTypeLabel: "Cliente",
			}),
		).toBe("Criação • Maria");
		expect(
			getAuditLogTitle({
				action: "UPDATE",
				entityName: "",
				entityTypeLabel: "Contrato",
			}),
		).toBe("Alteração • Contrato");
		expect(
			getAuditLogTitle({
				action: "CUSTOM",
				entityName: "",
				entityTypeLabel: "",
			}),
		).toBe("CUSTOM • Sistema");
	});
});
