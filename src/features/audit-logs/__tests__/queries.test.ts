import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		auditLog: {
			count: vi.fn(),
			findMany: vi.fn(),
		},
	},
}));

vi.mock("@/shared/lib/prisma", () => ({
	prisma: prismaMock,
}));

import {
	getAuditLogActions,
	getAuditLogActors,
	getAuditLogEntityTypes,
	getAuditLogs,
} from "../data/queries";

describe("audit-log data queries", () => {
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
				firmId: 1,
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
				}),
			],
			total: 1,
			page: 2,
			pageSize: 10,
		});
	});

	it("builds distinct action, entity-type, and actor options inside tenant scope", async () => {
		prismaMock.auditLog.findMany
			.mockResolvedValueOnce([{ action: "CREATE" }, { action: "UPDATE" }])
			.mockResolvedValueOnce([{ entityType: "Client" }, { entityType: "Fee" }])
			.mockResolvedValueOnce([{ actorName: "Admin" }, { actorName: "User" }]);

		await expect(getAuditLogActions(1)).resolves.toEqual([
			{ id: 1, value: "CREATE", label: "CREATE", isDisabled: false },
			{ id: 2, value: "UPDATE", label: "UPDATE", isDisabled: false },
		]);
		expect(prismaMock.auditLog.findMany).toHaveBeenNthCalledWith(1, {
			where: { firmId: 1 },
			distinct: ["action"],
			select: { action: true },
			orderBy: { action: "asc" },
		});

		await expect(getAuditLogEntityTypes(1)).resolves.toEqual([
			{ id: 1, value: "Client", label: "Client", isDisabled: false },
			{ id: 2, value: "Fee", label: "Fee", isDisabled: false },
		]);

		await expect(getAuditLogActors(1)).resolves.toEqual([
			{ id: 1, value: "Admin", label: "Admin", isDisabled: false },
			{ id: 2, value: "User", label: "User", isDisabled: false },
		]);
	});
});
