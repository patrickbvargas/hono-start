import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		auditLog: {
			count: vi.fn(),
			findMany: vi.fn(),
			findFirst: vi.fn(),
		},
	},
}));

vi.mock("@/shared/lib/prisma", () => ({
	prisma: prismaMock,
}));

import {
	getAuditHistory,
	getAuditLogActions,
	getAuditLogActors,
	getAuditLogById,
	getAuditLogEntityTypes,
	getAuditLogs,
	getAuditVisibilityWhere,
} from "../data/queries";
import { auditLogSearchSchema } from "../schemas/search";

describe("audit-log data queries", () => {
	it("applies subject visibility to history, detail, counts and filter options", async () => {
		const accessWhere = {
			OR: [{ entityType: "Contract", entityId: "7", firmId: 2 }],
		};
		prismaMock.auditLog.findMany.mockResolvedValue([]);
		prismaMock.auditLog.count.mockResolvedValue(0);
		await getAuditHistory({
			firmId: 2,
			entityType: "Contract",
			entityId: 8,
			accessWhere,
		});
		expect(prismaMock.auditLog.findMany).toHaveBeenLastCalledWith(
			expect.objectContaining({
				where: {
					AND: [accessWhere],
					firmId: 2,
					entityType: "Contract",
					entityId: "8",
				},
			}),
		);
		await getAuditHistory({
			firmId: 2,
			entityType: "Employee",
			entityId: 8,
			accessWhere,
		});
		expect(prismaMock.auditLog.findMany).toHaveBeenLastCalledWith(
			expect.objectContaining({ where: { AND: [accessWhere], employeeId: 8 } }),
		);
		await getAuditLogs({
			firmId: 2,
			search: auditLogSearchSchema.parse({ query: "other" }),
			accessWhere,
		});
		expect(prismaMock.auditLog.count).toHaveBeenLastCalledWith({
			where: expect.objectContaining({ AND: [accessWhere] }),
		});
		prismaMock.auditLog.findFirst.mockResolvedValue(null);
		await expect(
			getAuditLogById({ firmId: 2, id: 99, accessWhere }),
		).rejects.toThrow("Log de auditoria não encontrado.");
		expect(prismaMock.auditLog.findFirst).toHaveBeenLastCalledWith({
			where: { id: 99, ...accessWhere },
		});
		for (const getOptions of [
			getAuditLogActions,
			getAuditLogActors,
			getAuditLogEntityTypes,
		]) {
			await getOptions(2, accessWhere);
			expect(prismaMock.auditLog.findMany).toHaveBeenLastCalledWith(
				expect.objectContaining({ where: accessWhere }),
			);
		}
	});
	it("loads complete entity history with tenant scope and no server pagination", async () => {
		prismaMock.auditLog.findMany.mockResolvedValueOnce([]);
		expect(
			await getAuditHistory({
				firmId: 4,
				entityType: "Contract",
				entityId: 62,
			}),
		).toEqual([]);
		expect(prismaMock.auditLog.findMany).toHaveBeenCalledWith({
			where: { firmId: 4, entityType: "Contract", entityId: "62" },
			orderBy: [{ createdAt: "desc" }, { id: "asc" }],
		});
		expect(prismaMock.auditLog.count).not.toHaveBeenCalled();
	});
	it("keeps exact contract identity in both list and total queries", async () => {
		prismaMock.auditLog.findMany.mockResolvedValueOnce([]);
		prismaMock.auditLog.count.mockResolvedValueOnce(0);
		await getAuditLogs({
			firmId: 4,
			search: auditLogSearchSchema.parse({
				entityType: ["Contract"],
				entityId: "62",
			}),
		});
		const where = {
			AND: [getAuditVisibilityWhere(4)],
			entityType: { in: ["Contract"] },
			entityId: "62",
		};
		expect(prismaMock.auditLog.findMany).toHaveBeenLastCalledWith(
			expect.objectContaining({ where }),
		);
		expect(prismaMock.auditLog.count).toHaveBeenLastCalledWith({ where });
	});
	beforeEach(() => {
		vi.clearAllMocks();
		prismaMock.auditLog.count.mockResolvedValue(1);
	});

	it("translates filters into tenant-scoped deterministic paginated audit queries", async () => {
		prismaMock.auditLog.findMany.mockResolvedValueOnce([
			{
				id: 1,
				createdAt: new Date("2026-01-20T00:00:00.000Z"),
				actorName: "Admin",
				actorEmail: "admin@example.com",
				action: "UPDATE",
				entityType: "Contract",
				entityName: "PROC-001",
				entityId: "99",
				ipAddress: "127.0.0.1",
				userAgent: "Vitest",
				changeData: { before: { id: 99 } },
				description: "Updated contract PROC-001.",
			},
		]);

		const result = await getAuditLogs({
			firmId: 1,
			search: {
				page: 2,
				limit: 10,
				column: "actorName",
				direction: "asc",
				query: "PROC",
				action: ["UPDATE"],
				entityType: ["Contract"],
				actorName: ["Admin"],
			},
		});

		expect(prismaMock.auditLog.findMany).toHaveBeenCalledWith({
			where: {
				AND: [getAuditVisibilityWhere(1)],
				OR: [
					{
						actorName: {
							contains: "PROC",
							mode: "insensitive",
						},
					},
					{
						entityName: {
							contains: "PROC",
							mode: "insensitive",
						},
					},
				],
				action: { in: ["UPDATE"] },
				entityType: { in: ["Contract"] },
				actorName: { in: ["Admin"] },
			},
			orderBy: [{ actorName: "asc" }, { id: "asc" }],
			skip: 10,
			take: 10,
		});
		expect(result).toEqual({
			data: [
				expect.objectContaining({
					id: 1,
					actorName: "Admin",
					entityType: "Contract",
					entityTypeLabel: "Contrato",
					description: "atualizou contrato PROC-001.",
				}),
			],
			total: 1,
			page: 2,
			pageSize: 10,
		});
	});

	it("normalizes system actor search and filters for audit log queries", async () => {
		prismaMock.auditLog.findMany.mockResolvedValueOnce([
			{
				id: 2,
				createdAt: new Date("2026-01-21T00:00:00.000Z"),
				actorName: "",
				actorEmail: null,
				action: "",
				entityType: "",
				entityName: "",
				entityId: null,
				ipAddress: null,
				userAgent: null,
				changeData: null,
				description: "",
			},
		]);

		const result = await getAuditLogs({
			firmId: 1,
			search: {
				page: 1,
				limit: 20,
				column: "occurredAt",
				direction: "desc",
				query: "Sistema",
				action: [],
				entityType: [],
				actorName: ["Sistema"],
			},
		});

		expect(prismaMock.auditLog.findMany).toHaveBeenCalledWith({
			where: {
				AND: [getAuditVisibilityWhere(1)],
				OR: [
					{
						actorName: {
							contains: "Sistema",
							mode: "insensitive",
						},
					},
					{
						entityName: {
							contains: "Sistema",
							mode: "insensitive",
						},
					},
					{
						actorName: {
							in: ["Sistema", ""],
						},
					},
				],
				actorName: { in: ["Sistema", ""] },
			},
			orderBy: [{ createdAt: "desc" }, { id: "asc" }],
			skip: 0,
			take: 20,
		});
		expect(result).toEqual({
			data: [
				expect.objectContaining({
					id: 2,
					actorName: "",
					entityType: "",
					entityTypeLabel: "",
					description: "",
				}),
			],
			total: 1,
			page: 1,
			pageSize: 20,
		});
	});

	it("builds distinct action, entity-type, and actor options inside tenant scope", async () => {
		prismaMock.auditLog.findMany
			.mockResolvedValueOnce([{ action: "CREATE" }, { action: "UPDATE" }])
			.mockResolvedValueOnce([{ entityType: "Client" }, { entityType: "Fee" }])
			.mockResolvedValueOnce([
				{ actorName: "" },
				{ actorName: "Admin" },
				{ actorName: "Sistema" },
				{ actorName: "User" },
			]);

		await expect(getAuditLogActions(1)).resolves.toEqual([
			{ id: 1, value: "CREATE", label: "CREATE", isDisabled: false },
			{ id: 2, value: "UPDATE", label: "UPDATE", isDisabled: false },
		]);
		expect(prismaMock.auditLog.findMany).toHaveBeenNthCalledWith(1, {
			where: getAuditVisibilityWhere(1),
			distinct: ["action"],
			select: { action: true },
			orderBy: { action: "asc" },
		});

		await expect(getAuditLogEntityTypes(1)).resolves.toEqual([
			{ id: 1, value: "Client", label: "Cliente", isDisabled: false },
			{ id: 2, value: "Fee", label: "Honorário", isDisabled: false },
		]);

		await expect(getAuditLogActors(1)).resolves.toEqual([
			{ id: 1, value: "Sistema", label: "Sistema", isDisabled: false },
			{ id: 2, value: "Admin", label: "Admin", isDisabled: false },
			{ id: 3, value: "User", label: "User", isDisabled: false },
		]);
	});

	it("translates english entity names before returning audit-log cards", async () => {
		prismaMock.auditLog.findMany.mockResolvedValueOnce([
			{
				id: 3,
				createdAt: new Date("2026-01-22T00:00:00.000Z"),
				actorName: "Admin",
				actorEmail: "admin@example.com",
				action: "UPDATE",
				entityType: "Remuneration",
				entityName: "Remuneration 594",
				entityId: "594",
				ipAddress: "127.0.0.1",
				userAgent: "Vitest",
				changeData: { before: { id: 594 } },
				description: "Updated remuneration 594.",
			},
		]);

		const result = await getAuditLogs({
			firmId: 1,
			search: {
				page: 1,
				limit: 10,
				column: "occurredAt",
				direction: "desc",
				query: "",
				action: [],
				entityType: [],
				actorName: [],
			},
		});

		expect(result.data).toEqual([
			expect.objectContaining({
				entityTypeLabel: "Remuneração",
				entityName: "Remuneração 594",
				description: "atualizou remuneração Remuneração 594.",
			}),
		]);
	});
	it.each(["Client", "Employee"] as const)(
		"loads shared %s and evidence history from any origin branch",
		async (entityType) => {
			prismaMock.auditLog.findMany.mockResolvedValueOnce([]);
			await getAuditHistory({ firmId: 2, entityType, entityId: 7 });
			expect(prismaMock.auditLog.findMany).toHaveBeenLastCalledWith({
				where: entityType === "Client" ? { clientId: 7 } : { employeeId: 7 },
				orderBy: [{ createdAt: "desc" }, { id: "asc" }],
			});
		},
	);
	it("does not widen operational visibility when sharing master evidence", () => {
		expect(getAuditVisibilityWhere(2)).toEqual({
			OR: [
				{ firmId: 2 },
				{ clientId: { not: null } },
				{ employeeId: { not: null } },
			],
		});
	});
});
