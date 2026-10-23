// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { buildAttachmentUploadInput, fileToBase64 } from "../utils/upload";

describe("attachment upload preparation", () => {
	it("encodes file contents and retains owner and metadata", async () => {
		const file = new File(["test"], "contrato.pdf", {
			type: "application/pdf",
		});
		expect(await fileToBase64(file)).toBe("dGVzdA==");
		expect(
			await buildAttachmentUploadInput({ contractId: 7, file }, null),
		).toEqual({
			contractId: 7,
			clientId: undefined,
			employeeId: undefined,
			expenseId: undefined,
			type: "PDF",
			fileName: "contrato.pdf",
			mimeType: "application/pdf",
			fileSize: 4,
			fileBase64: "dGVzdA==",
		});
	});
	it("reuses preparation only for the same file instance", async () => {
		const first = new File(["old"], "contrato.pdf", {
			type: "application/pdf",
		});
		const second = new File(["new"], "contrato.pdf", {
			type: "application/pdf",
		});
		const prepared = { file: first, fileBase64: "cached", type: "PDF" };
		expect(
			(await buildAttachmentUploadInput({ clientId: 1, file: first }, prepared))
				.fileBase64,
		).toBe("cached");
		expect(
			(
				await buildAttachmentUploadInput(
					{ clientId: 1, file: second },
					prepared,
				)
			).fileBase64,
		).toBe("bmV3");
	});
	it("keeps missing-file payload available for schema validation", async () => {
		expect(
			await buildAttachmentUploadInput({ employeeId: 2, file: null }, null),
		).toEqual({
			employeeId: 2,
			file: null,
			type: "",
			fileName: "",
			mimeType: "",
			fileSize: 0,
			fileBase64: "",
		});
	});
});
