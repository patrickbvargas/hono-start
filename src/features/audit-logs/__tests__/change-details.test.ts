import { describe, expect, it } from "vitest";
import { buildAuditChangePresentation } from "../utils/change-details";

describe("audit-log change details", () => {
	it("maps lookup values to domain labels and ignores before-only metadata in update diffs", () => {
		const result = buildAuditChangePresentation({
			action: "UPDATE",
			changeData: {
				before: {
					type: "Pessoa Física",
					typeId: 1,
					typeValue: "INDIVIDUAL",
					fullName: "Maria",
				},
				after: {
					type: "COMPANY",
					fullName: "Empresa Maria",
				},
			},
		});

		expect(result.mode).toBe("diff");
		expect(result.entries).toEqual([
			{
				label: "Tipo",
				path: "type",
				before: "Pessoa Física",
				after: "Pessoa Jurídica",
			},
			{
				label: "Nome",
				path: "fullName",
				before: "Maria",
				after: "Empresa Maria",
			},
		]);
	});

	it("hides unchanged fields when before and after use different representations", () => {
		const result = buildAuditChangePresentation({
			action: "UPDATE",
			changeData: {
				before: {
					type: "Pessoa Física",
					isActive: true,
				},
				after: {
					type: "INDIVIDUAL",
					isActive: true,
				},
			},
		});

		expect(result.mode).toBe("snapshot");
		expect(result.entries).toEqual([
			{
				label: "Tipo",
				path: "type",
				value: "Pessoa Física",
			},
			{
				label: "Ativo",
				path: "isActive",
				value: "Sim",
			},
		]);
	});

	it("uses contract language for status change permission", () => {
		const result = buildAuditChangePresentation({
			action: "UPDATE",
			changeData: {
				before: {
					allowStatusChange: false,
				},
				after: {
					allowStatusChange: true,
				},
			},
		});

		expect(result.mode).toBe("diff");
		expect(result.entries).toEqual([
			{
				label: "Alteração de status",
				path: "allowStatusChange",
				before: "Bloqueada",
				after: "Permitida",
			},
		]);
	});
});
