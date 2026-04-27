import { beforeEach, describe, expect, it, vi } from "vitest";

const { createAuditLogMock, prismaMock } = vi.hoisted(() => ({
	createAuditLogMock: vi.fn(),
	prismaMock: {
		remuneration: {
			update: vi.fn(),
		},
		$transaction: vi.fn(),
	},
}));

vi.mock("@/shared/lib/prisma", () => ({
	prisma: prismaMock,
}));

vi.mock("@/features/audit-logs/data/mutations", () => ({
	createAuditLog: createAuditLogMock,
}));

import { REMUNERATION_ERRORS } from "../constants/errors";
import {
	deleteRemuneration,
	restoreRemuneration,
	updateRemuneration,
} from "../data/mutations";

const baseAccess = {
	id: 1,
	deletedAt: null,
	parentFeeIsSoftDeleted: false,
	contractProcessNumber: "PROC-001",
	resource: {
		firmId: 1,
		employeeId: 10,
	},
};

describe("remuneration data mutations", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		prismaMock.$transaction.mockImplementation(async (callback) =>
			callback(prismaMock),
		);
		prismaMock.remuneration.update.mockResolvedValue({});
	});

	it("updates remuneration as manual override and writes audit log", async () => {
		await expect(
			updateRemuneration({
				actor: { id: 1, name: "Admin", email: "admin@example.com" },
				access: baseAccess,
				input: {
					id: 1,
					amount: 500,
					effectivePercentage: 0.25,
				},
			}),
		).resolves.toEqual({ success: true });

		expect(prismaMock.remuneration.update).toHaveBeenCalledWith({
			where: { id: 1 },
			data: {
				amount: 500,
				effectivePercentage: 0.25,
				isSystemGenerated: false,
			},
		});
		expect(createAuditLogMock).toHaveBeenCalledWith(
			prismaMock,
			expect.objectContaining({
				firmId: 1,
				action: "UPDATE",
				entityType: "Remuneration",
				entityId: 1,
			}),
		);
	});

	it("blocks editing deleted remunerations and remunerations linked to deleted fees", async () => {
		await expect(
			updateRemuneration({
				access: {
					...baseAccess,
					deletedAt: new Date("2026-01-01T00:00:00.000Z"),
				},
				input: {
					id: 1,
					amount: 500,
					effectivePercentage: 0.25,
				},
			}),
		).rejects.toThrow(REMUNERATION_ERRORS.REMUNERATION_EDIT_DELETED);

		await expect(
			updateRemuneration({
				access: { ...baseAccess, parentFeeIsSoftDeleted: true },
				input: {
					id: 1,
					amount: 500,
					effectivePercentage: 0.25,
				},
			}),
		).rejects.toThrow(REMUNERATION_ERRORS.REMUNERATION_EDIT_PARENT_DELETED);

		expect(prismaMock.$transaction).not.toHaveBeenCalled();
	});

	it("soft-deletes remuneration and writes audit log", async () => {
		await expect(
			deleteRemuneration({
				actor: { id: 1, name: "Admin", email: "admin@example.com" },
				access: baseAccess,
				id: 1,
			}),
		).resolves.toEqual({ success: true });

		expect(prismaMock.remuneration.update).toHaveBeenCalledWith({
			where: { id: 1 },
			data: {
				deletedAt: expect.any(Date),
			},
		});
		expect(createAuditLogMock).toHaveBeenCalledWith(
			prismaMock,
			expect.objectContaining({
				action: "DELETE",
				entityType: "Remuneration",
				entityId: 1,
			}),
		);
	});

	it("blocks restore when parent fee is deleted and otherwise clears deletedAt", async () => {
		await expect(
			restoreRemuneration({
				access: { ...baseAccess, parentFeeIsSoftDeleted: true },
				id: 1,
			}),
		).rejects.toThrow(REMUNERATION_ERRORS.REMUNERATION_RESTORE_PARENT_DELETED);

		await expect(
			restoreRemuneration({
				actor: { id: 1, name: "Admin", email: "admin@example.com" },
				access: baseAccess,
				id: 1,
			}),
		).resolves.toEqual({ success: true });

		expect(prismaMock.remuneration.update).toHaveBeenCalledWith({
			where: { id: 1 },
			data: {
				deletedAt: null,
			},
		});
		expect(createAuditLogMock).toHaveBeenCalledWith(
			prismaMock,
			expect.objectContaining({
				action: "RESTORE",
				entityType: "Remuneration",
				entityId: 1,
			}),
		);
	});
});
