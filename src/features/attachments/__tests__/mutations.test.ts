import { beforeEach, describe, expect, it, vi } from "vitest";
import { ATTACHMENT_ERRORS } from "../constants/errors";

const {
	createAuditLogMock,
	getAttachmentTypeByValueMock,
	prismaMock,
	removeAttachmentFileMock,
	uploadAttachmentFileMock,
} = vi.hoisted(() => ({
	createAuditLogMock: vi.fn(),
	getAttachmentTypeByValueMock: vi.fn(),
	prismaMock: {
		attachment: {
			create: vi.fn(),
			findFirst: vi.fn(),
			update: vi.fn(),
		},
		$transaction: vi.fn(),
	},
	removeAttachmentFileMock: vi.fn(),
	uploadAttachmentFileMock: vi.fn(),
}));

vi.mock("@/shared/lib/prisma", () => ({
	prisma: prismaMock,
}));

vi.mock("@/features/audit-logs/data/mutations", () => ({
	createAuditLog: createAuditLogMock,
}));

vi.mock("@/shared/lib/attachment-storage", () => ({
	createAttachmentStoragePath: vi.fn(() => "firms/1/client/9/test.pdf"),
	removeAttachmentFile: removeAttachmentFileMock,
	uploadAttachmentFile: uploadAttachmentFileMock,
}));

vi.mock("../data/queries", () => ({
	getAttachmentTypeByValue: getAttachmentTypeByValueMock,
}));

import { createAttachment, deleteAttachment } from "../data/mutations";

describe("attachment data mutations", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		getAttachmentTypeByValueMock.mockResolvedValue({
			id: 30,
			value: "PDF",
			label: "PDF",
			isActive: true,
		});
		prismaMock.attachment.create.mockResolvedValue({
			id: 50,
			fileName: "contrato.pdf",
		});
		prismaMock.attachment.findFirst.mockResolvedValue({
			id: 50,
			fileName: "contrato.pdf",
			deletedAt: null,
		});
		prismaMock.attachment.update.mockResolvedValue({});
		prismaMock.$transaction.mockImplementation(async (callback) =>
			callback(prismaMock),
		);
		uploadAttachmentFileMock.mockResolvedValue({});
		removeAttachmentFileMock.mockResolvedValue({});
	});

	it("uploads storage object before persisting metadata and audits the write", async () => {
		await expect(
			createAttachment({
				actor: {
					id: 10,
					name: "Admin",
					email: "admin@example.com",
				},
				firmId: 1,
				input: {
					clientId: 9,
					type: "PDF",
					fileName: "contrato.pdf",
					mimeType: "application/pdf",
					fileSize: 1024,
					fileBase64: "dGVzdA==",
					isActive: true,
				},
			}),
		).resolves.toEqual({ success: true });

		expect(uploadAttachmentFileMock).toHaveBeenCalledOnce();
		expect(prismaMock.attachment.create).toHaveBeenCalledWith({
			data: expect.objectContaining({
				firmId: 1,
				clientId: 9,
				typeId: 30,
				fileName: "contrato.pdf",
				mimeType: "application/pdf",
				fileSize: 1024,
			}),
		});
		expect(createAuditLogMock).toHaveBeenCalledWith(
			prismaMock,
			expect.objectContaining({
				action: "CREATE",
				entityType: "Attachment",
			}),
		);
	});

	it("rejects unknown and inactive attachment types before upload", async () => {
		getAttachmentTypeByValueMock.mockResolvedValueOnce(null);

		await expect(
			createAttachment({
				firmId: 1,
				input: {
					clientId: 9,
					type: "PDF",
					fileName: "contrato.pdf",
					mimeType: "application/pdf",
					fileSize: 1024,
					fileBase64: "dGVzdA==",
					isActive: true,
				},
			}),
		).rejects.toThrow(ATTACHMENT_ERRORS.TYPE_NOT_FOUND);

		getAttachmentTypeByValueMock.mockResolvedValueOnce({
			id: 30,
			value: "PDF",
			label: "PDF",
			isActive: false,
		});

		await expect(
			createAttachment({
				firmId: 1,
				input: {
					clientId: 9,
					type: "PDF",
					fileName: "contrato.pdf",
					mimeType: "application/pdf",
					fileSize: 1024,
					fileBase64: "dGVzdA==",
					isActive: true,
				},
			}),
		).rejects.toThrow(ATTACHMENT_ERRORS.TYPE_INACTIVE);

		expect(uploadAttachmentFileMock).not.toHaveBeenCalled();
	});

	it("maps storage upload failures to the safe attachment error", async () => {
		uploadAttachmentFileMock.mockRejectedValue(new Error("storage down"));

		await expect(
			createAttachment({
				firmId: 1,
				input: {
					clientId: 9,
					type: "PDF",
					fileName: "contrato.pdf",
					mimeType: "application/pdf",
					fileSize: 1024,
					fileBase64: "dGVzdA==",
					isActive: true,
				},
			}),
		).rejects.toThrow(ATTACHMENT_ERRORS.STORAGE_UPLOAD_FAILED);

		expect(prismaMock.$transaction).not.toHaveBeenCalled();
		expect(removeAttachmentFileMock).not.toHaveBeenCalled();
	});

	it("cleans up uploaded storage object when metadata persistence fails", async () => {
		prismaMock.$transaction.mockRejectedValue(new Error("db failed"));

		await expect(
			createAttachment({
				firmId: 1,
				input: {
					clientId: 9,
					type: "PDF",
					fileName: "contrato.pdf",
					mimeType: "application/pdf",
					fileSize: 1024,
					fileBase64: "dGVzdA==",
					isActive: true,
				},
			}),
		).rejects.toThrow(ATTACHMENT_ERRORS.PERSISTENCE_FAILED);

		expect(uploadAttachmentFileMock).toHaveBeenCalledOnce();
		expect(removeAttachmentFileMock).toHaveBeenCalledWith({
			path: "firms/1/client/9/test.pdf",
		});
	});

	it("soft-deletes attachments transactionally", async () => {
		await expect(
			deleteAttachment({
				firmId: 1,
				id: 50,
			}),
		).resolves.toEqual({ success: true });

		expect(prismaMock.attachment.update).toHaveBeenCalledWith({
			where: { id: 50 },
			data: { deletedAt: expect.any(Date) },
		});
	});

	it("rejects delete when the attachment does not exist in firm scope", async () => {
		prismaMock.attachment.findFirst.mockResolvedValueOnce(null);

		await expect(
			deleteAttachment({
				firmId: 1,
				id: 999,
			}),
		).rejects.toThrow(ATTACHMENT_ERRORS.DETAIL_NOT_FOUND);

		expect(prismaMock.$transaction).not.toHaveBeenCalled();
	});
});
