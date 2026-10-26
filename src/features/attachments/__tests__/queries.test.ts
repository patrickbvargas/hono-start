import { beforeEach, describe, expect, it, vi } from "vitest";
import { ATTACHMENT_ERRORS } from "../constants/errors";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		auditLog: { findMany: vi.fn() },
		fee: { findFirst: vi.fn() },
		remuneration: { findFirst: vi.fn() },
		attachment: { findFirst: vi.fn(), findMany: vi.fn() },
		client: {
			findFirst: vi.fn(),
		},
		contract: {
			findFirst: vi.fn(),
		},
		employee: {
			findFirst: vi.fn(),
		},
	},
}));

vi.mock("@/shared/lib/prisma", () => ({
	prisma: prismaMock,
}));

import {
	assertAttachmentOwnerExists,
	getAttachmentAccessById,
	getAttachmentContractOwnerResource,
	getAttachmentEmployeeOwnerResource,
	getAttachmentFeeOwnerResource,
	getAttachmentRemunerationOwnerResource,
	getAttachmentsByOwner,
} from "../data/queries";

describe("attachment owner access queries", () => {
	it("maps only original tenant-scoped upload names with explicit unknown fallback", async () => {
		const row = {
			fileName: "evidence.pdf",
			fileSize: 100,
			mimeType: "application/pdf",
			type: { id: 1, label: "PDF", value: "PDF" },
			isActive: true,
			deletedAt: null,
			createdAt: new Date("2026-10-26T12:00:00Z"),
			updatedAt: null,
		};
		prismaMock.attachment.findMany.mockResolvedValue(
			[1, 2, 3, 4].map((id) => ({ ...row, id })),
		);
		prismaMock.auditLog.findMany.mockResolvedValue([
			{ entityId: "1", actorName: "Maria" },
			{ entityId: "1", actorName: "Later actor" },
			{ entityId: "2", actorName: "Sistema" },
			{ entityId: "3", actorName: "  " },
		]);
		const result = await getAttachmentsByOwner({
			firmId: 100,
			input: { clientId: 14 },
		});
		expect(result.map((item) => item.uploadedByName)).toEqual([
			"Maria",
			null,
			null,
			null,
		]);
		expect(prismaMock.auditLog.findMany).toHaveBeenCalledWith({
			where: {
				firmId: 100,
				entityType: "Attachment",
				action: "CREATE",
				entityId: { in: ["1", "2", "3", "4"] },
			},
			select: { entityId: true, actorName: true },
			orderBy: [{ createdAt: "asc" }, { id: "asc" }],
		});
	});

	it("does not query attribution for empty attachment lists", async () => {
		prismaMock.attachment.findMany.mockResolvedValue([]);
		await expect(
			getAttachmentsByOwner({ firmId: 100, input: { clientId: 14 } }),
		).resolves.toEqual([]);
		expect(prismaMock.auditLog.findMany).not.toHaveBeenCalled();
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	const contract = {
		id: 4,
		firmId: 100,
		deletedAt: null,
		allowStatusChange: true,
		status: { value: "COMPLETED" },
		assignments: [
			{
				employeeId: 7,
				employee: { type: { value: "LAWYER" } },
				assignmentType: { value: "RESPONSIBLE" },
			},
		],
	};
	const fee = {
		id: 9,
		firmId: 100,
		deletedAt: null,
		revenue: { firmId: 100, contractId: 4, deletedAt: null },
	};
	const remuneration = {
		id: 12,
		firmId: 100,
		feeId: 9,
		deletedAt: null,
		contractEmployee: {
			firmId: 100,
			employeeId: 7,
			deletedAt: null,
			employee: { firmId: 100, deletedAt: null },
			contract: { firmId: 100, deletedAt: null },
		},
	};

	it("resolves fee assignment scope and remuneration beneficiary from persisted parents", async () => {
		prismaMock.fee.findFirst.mockResolvedValue(fee);
		prismaMock.contract.findFirst.mockResolvedValue(contract);
		prismaMock.remuneration.findFirst.mockResolvedValue(remuneration);
		await expect(getAttachmentFeeOwnerResource(100, 9)).resolves.toMatchObject({
			resource: {
				firmId: 100,
				statusValue: "COMPLETED",
				assignments: [
					{
						employeeId: 7,
						employeeTypeValue: "LAWYER",
						assignmentTypeValue: "RESPONSIBLE",
					},
				],
			},
		});
		await expect(
			getAttachmentRemunerationOwnerResource(100, 12),
		).resolves.toMatchObject({ resource: { firmId: 100, employeeId: 7 } });
		expect(prismaMock.fee.findFirst).toHaveBeenCalledWith(
			expect.objectContaining({ where: { id: 9, firmId: 100 } }),
		);
		expect(prismaMock.remuneration.findFirst).toHaveBeenCalledWith(
			expect.objectContaining({ where: { id: 12, firmId: 100 } }),
		);
	});

	it.each(["fee", "remuneration"] as const)(
		"rejects absent or cross-firm %s owners",
		async (kind) => {
			prismaMock[kind].findFirst.mockResolvedValue(null);
			await expect(
				assertAttachmentOwnerExists({
					firmId: 100,
					input: kind === "fee" ? { feeId: 9 } : { remunerationId: 12 },
				}),
			).rejects.toThrow(ATTACHMENT_ERRORS.OWNER_NOT_FOUND);
		},
	);

	it("propagates financial ancestor deletion for upload lifecycle checks", async () => {
		const deletedAt = new Date();
		prismaMock.fee.findFirst.mockResolvedValue({
			...fee,
			revenue: { ...fee.revenue, deletedAt },
		});
		prismaMock.contract.findFirst.mockResolvedValue(contract);
		prismaMock.remuneration.findFirst.mockResolvedValue(remuneration);
		await expect(getAttachmentFeeOwnerResource(100, 9)).resolves.toMatchObject({
			deletedAt,
		});
		await expect(
			getAttachmentRemunerationOwnerResource(100, 12),
		).resolves.toMatchObject({ deletedAt });
	});

	it("rejects cross-firm financial ancestry", async () => {
		prismaMock.fee.findFirst.mockResolvedValue({
			...fee,
			revenue: { ...fee.revenue, firmId: 999 },
		});
		await expect(getAttachmentFeeOwnerResource(100, 9)).resolves.toBeNull();
		prismaMock.remuneration.findFirst.mockResolvedValue({
			...remuneration,
			contractEmployee: { ...remuneration.contractEmployee, firmId: 999 },
		});
		await expect(
			getAttachmentRemunerationOwnerResource(100, 12),
		).resolves.toBeNull();
	});

	it.each([{ feeId: 9 }, { remunerationId: 12 }])(
		"lists only files for the exact financial owner %o",
		async (owner) => {
			prismaMock.attachment.findMany.mockResolvedValue([]);
			await getAttachmentsByOwner({ firmId: 100, input: owner });
			expect(prismaMock.attachment.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { firmId: 100, deletedAt: null, ...owner },
				}),
			);
		},
	);

	it.each([{ feeId: 9 }, { remunerationId: 12 }])(
		"retains financial owner identity for protected file and delete access %o",
		async (owner) => {
			prismaMock.attachment.findFirst.mockResolvedValue({
				id: 30,
				firmId: 100,
				...owner,
			});
			await expect(getAttachmentAccessById(100, 30)).resolves.toMatchObject({
				ownerInput: owner,
			});
		},
	);

	it("resolves employee owners only within the authenticated firm", async () => {
		prismaMock.employee.findFirst.mockResolvedValue({
			id: 7,
			deletedAt: null,
			firmId: 100,
		});

		await expect(
			getAttachmentEmployeeOwnerResource(100, 7),
		).resolves.toMatchObject({
			id: 7,
			deletedAt: null,
			resource: {
				employeeId: 7,
				firmId: 100,
			},
		});

		prismaMock.employee.findFirst.mockResolvedValue(null);

		await expect(
			getAttachmentEmployeeOwnerResource(100, 7),
		).resolves.toBeNull();
	});

	it("rejects cross-tenant contract owners", async () => {
		prismaMock.contract.findFirst.mockResolvedValue(null);

		await expect(
			getAttachmentContractOwnerResource(100, 9),
		).resolves.toBeNull();
	});

	it("throws before persistence when owner context does not exist", async () => {
		prismaMock.client.findFirst.mockResolvedValue(null);

		await expect(
			assertAttachmentOwnerExists({
				firmId: 100,
				input: { clientId: 99 },
			}),
		).rejects.toThrow(ATTACHMENT_ERRORS.OWNER_NOT_FOUND);
	});
});
