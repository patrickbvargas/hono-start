import { describe, expect, it } from "vitest";
import { ATTACHMENT_ERRORS } from "../constants/errors";
import {
	assertAttachmentFileAccepted,
	assertAttachmentTypeMatchesFile,
} from "../rules/file";
import {
	assertAttachmentTypeCanBeSelected,
	assertAttachmentTypeExists,
} from "../rules/lookups";
import {
	assertAttachmentOwnerCanReceiveUpload,
	assertSingleAttachmentOwnerContext,
} from "../rules/owner";

describe("attachment rule assertions", () => {
	it("accepts supported files and infers the attachment type", () => {
		expect(
			assertAttachmentFileAccepted({
				fileName: "contrato.pdf",
				mimeType: "application/pdf",
				fileSize: 1024,
			}),
		).toBe("PDF");

		expect(
			assertAttachmentFileAccepted({
				fileName: "imagem.jpeg",
				mimeType: "",
				fileSize: 1024,
			}),
		).toBe("JPG");
	});

	it("rejects invalid files and mismatched payload types", () => {
		expect(() =>
			assertAttachmentFileAccepted({
				fileName: "virus.exe",
				mimeType: "application/octet-stream",
				fileSize: 1024,
			}),
		).toThrow(ATTACHMENT_ERRORS.INVALID_FILE_TYPE);

		expect(() =>
			assertAttachmentFileAccepted({
				fileName: "contrato.pdf",
				mimeType: "application/pdf",
				fileSize: 11 * 1024 * 1024,
			}),
		).toThrow(ATTACHMENT_ERRORS.FILE_TOO_LARGE);

		expect(() =>
			assertAttachmentTypeMatchesFile({
				type: "PNG",
				fileName: "contrato.pdf",
				mimeType: "application/pdf",
				fileSize: 1024,
			}),
		).toThrow(ATTACHMENT_ERRORS.TYPE_MISMATCH);
	});

	it("requires exactly one owner context", () => {
		expect(() =>
			assertSingleAttachmentOwnerContext({ clientId: 1 }),
		).not.toThrow();
		expect(() => assertSingleAttachmentOwnerContext({})).toThrow(
			"Selecione exatamente um contexto para o anexo.",
		);
		expect(() =>
			assertSingleAttachmentOwnerContext({ clientId: 1, employeeId: 2 }),
		).toThrow("Selecione exatamente um contexto para o anexo.");
	});

	it("rejects uploads for deleted owners and locked contracts", () => {
		expect(() =>
			assertAttachmentOwnerCanReceiveUpload({
				deletedAt: new Date(),
				ownerKind: "client",
			}),
		).toThrow(ATTACHMENT_ERRORS.OWNER_NOT_FOUND);

		expect(() =>
			assertAttachmentOwnerCanReceiveUpload({
				deletedAt: null,
				ownerKind: "contract",
				isWritableContract: false,
			}),
		).toThrow(ATTACHMENT_ERRORS.CONTRACT_NOT_WRITABLE);
	});

	it("validates lookup existence and activity", () => {
		const activeType = {
			id: 1,
			value: "PDF",
			label: "PDF",
			isActive: true,
		};

		expect(() => assertAttachmentTypeExists(null)).toThrow(
			ATTACHMENT_ERRORS.TYPE_NOT_FOUND,
		);
		expect(() => assertAttachmentTypeExists(activeType)).not.toThrow();
		expect(() =>
			assertAttachmentTypeCanBeSelected({ ...activeType, isActive: false }),
		).toThrow(ATTACHMENT_ERRORS.TYPE_INACTIVE);
	});
});
