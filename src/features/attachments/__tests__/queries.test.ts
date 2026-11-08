import { beforeEach, describe, expect, it, vi } from "vitest";

const mock = vi.hoisted(() => ({
	prisma: {
		contract: { findFirst: vi.fn() },
		expense: { findFirst: vi.fn() },
		receivable: { findFirst: vi.fn() },
		payable: { findFirst: vi.fn() },
		receipt: { findFirst: vi.fn() },
		payment: { findFirst: vi.fn() },
		remunerationPayable: { findFirst: vi.fn() },
		attachment: { findMany: vi.fn(), findFirst: vi.fn() },
		auditLog: { findMany: vi.fn() },
	},
	person: vi.fn(),
}));
vi.mock("@/shared/lib/prisma", () => ({ prisma: mock.prisma }));
vi.mock("@/features/people", () => ({ getPersonAccessResource: mock.person }));
vi.mock("@/shared/config/env", () => ({
	env: { APP_URL: "http://localhost:3000" },
}));

import type { LoggedUserSession } from "@/shared/session";
import {
	assertAttachmentOwnerExists,
	getAttachmentAccessById,
	getAttachmentsByOwner,
	getAttachmentVisibilityWhere,
} from "../data/queries";

beforeEach(() => {
	vi.resetAllMocks();
	mock.prisma.contract.findFirst.mockResolvedValue({
		id: 3,
		firmId: 1,
		deletedAt: null,
		allowStatusChange: true,
		status: { value: "ACTIVE" },
		assignments: [],
	});
	mock.prisma.receivable.findFirst.mockResolvedValue({
		id: 2,
		contractRevenueReceivable: { contractId: 3 },
	});
	mock.prisma.auditLog.findMany.mockResolvedValue([]);
	mock.prisma.attachment.findMany.mockResolvedValue([]);
});
describe("current attachment owners", () => {
	it("checks actual person visibility through the owning public boundary", async () => {
		mock.person.mockResolvedValue({ id: 7, deletedAt: null });
		const session = { firm: { id: 1 } } as LoggedUserSession;
		const owner = await assertAttachmentOwnerExists({
			firmId: 1,
			session,
			input: { personId: 7 },
		});
		expect(owner.access).toMatchObject({ id: 7, firmId: 1 });
		expect(mock.person).toHaveBeenCalledWith({ session, id: 7 });
	});
	it("does not allow person reads without a session", async () => {
		await expect(
			assertAttachmentOwnerExists({ firmId: 1, input: { personId: 7 } }),
		).rejects.toThrow();
		expect(mock.person).not.toHaveBeenCalled();
	});
	it("retains financial access after operational soft deletion", async () => {
		mock.prisma.contract.findFirst.mockResolvedValue({
			id: 3,
			firmId: 1,
			deletedAt: new Date(),
			allowStatusChange: true,
			status: { value: "CANCELLED" },
			assignments: [],
		});
		const owner = await assertAttachmentOwnerExists({
			firmId: 1,
			input: { receivableId: 2 },
		});
		expect(owner.access.deletedAt).toBeNull();
		expect(owner.access.resource.contract).toMatchObject({
			firmId: 1,
			statusValue: "CANCELLED",
		});
	});
	it("resolves receipts through the actual scoped title instead of treating the receipt ID as a title ID", async () => {
		mock.prisma.receipt.findFirst.mockResolvedValue({ receivableId: 2 });
		const owner = await assertAttachmentOwnerExists({
			firmId: 1,
			input: { receiptId: 9 },
		});
		expect(owner.owner).toEqual({ ownerKind: "receipt", ownerId: 9 });
		expect(mock.prisma.receipt.findFirst).toHaveBeenCalledWith(
			expect.objectContaining({ where: { id: 9, firmId: 1 } }),
		);
		expect(mock.prisma.receivable.findFirst).toHaveBeenCalledWith(
			expect.objectContaining({ where: { id: 2, firmId: 1 } }),
		);
	});
	it("rejects missing or foreign movements before title reads", async () => {
		mock.prisma.receipt.findFirst.mockResolvedValue(null);
		await expect(
			assertAttachmentOwnerExists({ firmId: 1, input: { receiptId: 9 } }),
		).rejects.toThrow();
		expect(mock.prisma.receivable.findFirst).not.toHaveBeenCalled();
	});
	it("enforces financial title firm in listings and keeps person evidence global", async () => {
		await getAttachmentsByOwner({ firmId: 1, input: { receivableId: 2 } });
		expect(mock.prisma.attachment.findMany).toHaveBeenLastCalledWith(
			expect.objectContaining({
				where: { firmId: 1, receivableId: 2, deletedAt: null },
			}),
		);
		await getAttachmentsByOwner({ firmId: 1, input: { personId: 7 } });
		expect(mock.prisma.attachment.findMany).toHaveBeenLastCalledWith(
			expect.objectContaining({ where: { personId: 7, deletedAt: null } }),
		);
		expect(getAttachmentVisibilityWhere(1)).toEqual({
			OR: [{ firmId: 1 }, { personId: { not: null } }],
		});
	});
	it("returns actual owner fields for protected delivery", async () => {
		mock.prisma.attachment.findFirst.mockResolvedValue({
			id: 5,
			fileName: "receipt.pdf",
			storagePath: "opaque",
			mimeType: "application/pdf",
			firmId: 1,
			deletedAt: null,
			personId: null,
			receiptId: 9,
		});
		expect((await getAttachmentAccessById(1, 5))?.ownerInput).toMatchObject({
			receiptId: 9,
		});
	});
});
