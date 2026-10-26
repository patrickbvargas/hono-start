// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import {
	attachmentBatchFormInputSchema,
	attachmentBatchUploadInputSchema,
} from "../schemas/form";
import { uploadAttachmentBatch } from "../utils/upload-batch";

function file(name = "documento.pdf") {
	return new File(["test"], name, { type: "application/pdf" });
}

describe("atomic attachment bulk upload", () => {
	it.each([{ feeId: 9 }, { remunerationId: 12 }])(
		"prepares one batch for the financial owner %o",
		async (owner) => {
			const upload = vi.fn().mockResolvedValue(undefined);
			await uploadAttachmentBatch({
				input: { ...owner, files: [file("pix.pdf"), file("calculo.pdf")] },
				upload,
				onProgress: vi.fn(),
			});
			expect(upload).toHaveBeenCalledOnce();
			expect(upload.mock.calls[0][0]).toMatchObject({
				...owner,
				files: [{ fileName: "pix.pdf" }, { fileName: "calculo.pdf" }],
			});
		},
	);
	it("accepts one to 10 files and rejects zero or 11", () => {
		for (const count of [1, 10]) {
			expect(
				attachmentBatchFormInputSchema.safeParse({
					clientId: 1,
					files: Array.from({ length: count }, () => file()),
				}).success,
			).toBe(true);
		}
		for (const count of [0, 11]) {
			expect(
				attachmentBatchFormInputSchema.safeParse({
					clientId: 1,
					files: Array.from({ length: count }, () => file()),
				}).success,
			).toBe(false);
		}
	});
	it("enforces batch limits and file rules on the server payload", () => {
		const valid = {
			type: "PDF",
			fileName: "documento.pdf",
			mimeType: "application/pdf",
			fileSize: 4,
			fileBase64: "dGVzdA==",
		};
		expect(
			attachmentBatchUploadInputSchema.safeParse({
				clientId: 1,
				files: Array(10).fill(valid),
			}).success,
		).toBe(true);
		expect(
			attachmentBatchUploadInputSchema.safeParse({
				clientId: 1,
				files: Array(11).fill(valid),
			}).success,
		).toBe(false);
		expect(
			attachmentBatchUploadInputSchema.safeParse({
				clientId: 1,
				files: [valid, { ...valid, fileSize: 11 * 1024 * 1024 }],
			}).success,
		).toBe(false);
		expect(
			attachmentBatchUploadInputSchema.safeParse({
				clientId: 1,
				employeeId: 2,
				files: [valid],
			}).success,
		).toBe(false);
	});
	it("rejects invalid and oversize files before uploading anything", async () => {
		const upload = vi.fn();
		const oversized = new File(
			[new Uint8Array(10 * 1024 * 1024 + 1)],
			"grande.pdf",
			{ type: "application/pdf" },
		);
		for (const invalid of [
			new File(["test"], "script.exe", { type: "application/octet-stream" }),
			oversized,
		]) {
			await expect(
				uploadAttachmentBatch({
					input: { clientId: 1, files: [file(), invalid] },
					upload,
					onProgress: vi.fn(),
				}),
			).rejects.toThrow();
		}
		expect(upload).not.toHaveBeenCalled();
	});
	it("sends all 10 files in one request", async () => {
		const files = Array.from({ length: 10 }, (_, index) =>
			file(`${index}.pdf`),
		);
		const upload = vi.fn().mockResolvedValue(undefined);
		const onProgress = vi.fn();
		await uploadAttachmentBatch({
			input: { expenseId: 4, files },
			upload,
			onProgress,
		});
		expect(upload).toHaveBeenCalledOnce();
		expect(upload.mock.calls[0][0]).toMatchObject({
			expenseId: 4,
			files: files.map((item) => ({
				fileName: item.name,
				fileBase64: "dGVzdA==",
				type: "PDF",
			})),
		});
		expect(onProgress).toHaveBeenLastCalledWith(10, 10);
	});
	it("retains the entire selection after a failed operation", async () => {
		const files = [file("a.pdf"), file("b.pdf")];
		const error = new Error("Falha de envio");
		const upload = vi.fn().mockRejectedValue(error);
		await expect(
			uploadAttachmentBatch({
				input: { clientId: 1, files },
				upload,
				onProgress: vi.fn(),
			}),
		).rejects.toThrow(error);
		expect(files).toHaveLength(2);
		expect(upload).toHaveBeenCalledOnce();
	});
});
