import { beforeEach, describe, expect, it, vi } from "vitest";
import { ATTACHMENT_ERRORS } from "../constants/errors";

const {
	AttachmentStorageCapacityErrorMock,
	createAuditLogMock,
	getAttachmentTypeByValueMock,
	isAttachmentStorageCapacityErrorMock,
	prismaMock,
	removeAttachmentFileMock,
	uploadAttachmentFileMock,
} = vi.hoisted(() => ({
	AttachmentStorageCapacityErrorMock: class AttachmentStorageCapacityErrorMock extends Error {
		code = "capacity_exceeded" as const;
	},
	createAuditLogMock: vi.fn(),
	getAttachmentTypeByValueMock: vi.fn(),
	isAttachmentStorageCapacityErrorMock: vi.fn(
		(error: unknown) =>
			error instanceof AttachmentStorageCapacityErrorMock &&
			error.code === "capacity_exceeded",
	),
	prismaMock: {
		attachment: {
			create: vi.fn(),
			delete: vi.fn(),
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
	isAttachmentStorageCapacityError: isAttachmentStorageCapacityErrorMock,
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
			firmId: 1,
			storagePath: "firms/1/client/9/test.pdf",
		});
		prismaMock.attachment.delete.mockResolvedValue({});
		prismaMock.attachment.update.mockResolvedValue({});
		prismaMock.$transaction.mockImplementation(async (callback) =>
			callback(prismaMock),
		);
		uploadAttachmentFileMock.mockResolvedValue({});
		removeAttachmentFileMock.mockResolvedValue({});
		isAttachmentStorageCapacityErrorMock.mockImplementation(
			(error: unknown) =>
				error instanceof AttachmentStorageCapacityErrorMock &&
				error.code === "capacity_exceeded",
		);
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
				},
			}),
		).rejects.toThrow(ATTACHMENT_ERRORS.STORAGE_UPLOAD_FAILED);

		expect(prismaMock.$transaction).not.toHaveBeenCalled();
		expect(removeAttachmentFileMock).not.toHaveBeenCalled();
	});

	it("maps storage capacity failures to a clear attachment error", async () => {
		uploadAttachmentFileMock.mockRejectedValue(
			new AttachmentStorageCapacityErrorMock("quota exceeded"),
		);

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
				},
			}),
		).rejects.toThrow(ATTACHMENT_ERRORS.STORAGE_CAPACITY_EXCEEDED);

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
				},
			}),
		).rejects.toThrow(ATTACHMENT_ERRORS.PERSISTENCE_FAILED);

		expect(uploadAttachmentFileMock).toHaveBeenCalledOnce();
		expect(removeAttachmentFileMock).toHaveBeenCalledWith({
			path: "firms/1/client/9/test.pdf",
		});
	});

	it("deletes attachment storage object before removing database metadata", async () => {
		await expect(
			deleteAttachment({
				firmId: 1,
				id: 50,
			}),
		).resolves.toEqual({ success: true });

		expect(removeAttachmentFileMock).toHaveBeenCalledWith({
			path: "firms/1/client/9/test.pdf",
		});
		expect(prismaMock.attachment.delete).toHaveBeenCalledWith({
			where: { id: 50 },
		});
	});

	it("blocks database deletion when attachment storage removal fails", async () => {
		removeAttachmentFileMock.mockRejectedValueOnce(new Error("storage down"));

		await expect(
			deleteAttachment({
				firmId: 1,
				id: 50,
			}),
		).rejects.toThrow(ATTACHMENT_ERRORS.STORAGE_DELETE_FAILED);

		expect(prismaMock.attachment.delete).not.toHaveBeenCalled();
		expect(prismaMock.$transaction).not.toHaveBeenCalled();
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
