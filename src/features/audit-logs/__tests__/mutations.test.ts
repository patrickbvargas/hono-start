import { describe, expect, it } from "vitest";
import { buildAuditUpdateChangeData } from "../data/mutations";

describe("audit-log mutation helpers", () => {
	it("stores update payloads with aligned before/after shape and only changed fields", () => {
		expect(
			buildAuditUpdateChangeData({
				before: {
					id: 15,
					type: "Pessoa Jurídica",
					typeValue: "COMPANY",
					email: "contato1@empresa.matriz.test",
					phone: "11980000021",
					document: "10000001000190",
					fullName: "Alfa Consultoria Ltda",
					isActive: true,
					createdAt: "2026-05-08T18:10:27.129Z",
				},
				after: {
					id: 15,
					type: "COMPANY",
					email: "contato1@empresa.matriz.test",
					phone: "11980000021",
					document: "10000001000190",
					fullName: "Alfa Consultoria Ltda Teste",
					isActive: true,
				},
			}),
		).toEqual({
			before: {
				fullName: "Alfa Consultoria Ltda",
			},
			after: {
				fullName: "Alfa Consultoria Ltda Teste",
			},
		});
	});
});
