import { describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@/generated/prisma/client";
import { buildAuditUpdateChangeData, createAuditLog } from "../data/mutations";

describe("audit-log mutation helpers", () => {
	it.each(["CREATE", "UPDATE", "DELETE", "RESTORE"])(
		"preserves metadata and full technical payload for %s",
		async (action) => {
			const create = vi.fn().mockResolvedValue({});
			const db = { auditLog: { create } } as unknown as PrismaClient;
			const changeData = { before: { amount: 10 }, after: { amount: 20 } };
			await createAuditLog(db, {
				firmId: 2,
				actor: { id: 3, name: "Maria", email: "maria@example.com" },
				action,
				entityType: "Expense",
				entityId: 4,
				entityName: "Despesa",
				description: "Evento de despesa",
				ipAddress: "127.0.0.1",
				userAgent: "test",
				changeData,
			});
			expect(create).toHaveBeenCalledWith({
				data: {
					firmId: 2,
					actorId: 3,
					actorName: "Maria",
					actorEmail: "maria@example.com",
					action,
					entityType: "Expense",
					entityId: "4",
					entityName: "Despesa",
					description: "Evento de despesa",
					ipAddress: "127.0.0.1",
					userAgent: "test",
					changeData,
				},
			});
			expect(changeData.after.amount).toBe(20);
		},
	);
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
