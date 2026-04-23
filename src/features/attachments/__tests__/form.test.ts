import { describe, expect, it } from "vitest";
import { ATTACHMENT_ERRORS } from "../constants/errors";
import { attachmentUploadInputSchema } from "../schemas/form";

const baseInput = {
	clientId: 1,
	type: "PDF",
	fileName: "contrato.pdf",
	mimeType: "application/pdf",
	fileSize: 1024,
	fileBase64: "dGVzdA==",
	isActive: true,
};

describe("attachment form schema", () => {
	it("accepts a valid attachment payload", () => {
		expect(attachmentUploadInputSchema.parse(baseInput)).toEqual(baseInput);
	});

	it("rejects missing or multiple owner contexts", () => {
		const noOwner = attachmentUploadInputSchema.safeParse({
			...baseInput,
			clientId: undefined,
		});
		expect(noOwner.success).toBe(false);

		const multipleOwners = attachmentUploadInputSchema.safeParse({
			...baseInput,
			employeeId: 2,
		});
		expect(multipleOwners.success).toBe(false);
	});

	it("rejects unsupported types and oversized files", () => {
		const invalidType = attachmentUploadInputSchema.safeParse({
			...baseInput,
			type: "PDF",
			fileName: "contrato.exe",
			mimeType: "application/octet-stream",
		});
		expect(invalidType.success).toBe(false);
		if (!invalidType.success) {
			expect(invalidType.error.issues[0]?.message).toBe(
				ATTACHMENT_ERRORS.INVALID_FILE_TYPE,
			);
		}

		const oversized = attachmentUploadInputSchema.safeParse({
			...baseInput,
			fileSize: 11 * 1024 * 1024,
		});
		expect(oversized.success).toBe(false);
		if (!oversized.success) {
			expect(
				oversized.error.issues.some(
					(issue) => issue.message === ATTACHMENT_ERRORS.FILE_TOO_LARGE,
				),
			).toBe(true);
		}
	});
});
