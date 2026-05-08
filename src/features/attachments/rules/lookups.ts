import type { AttachmentType } from "@/generated/prisma/client";
import { ATTACHMENT_ERRORS } from "../constants/errors";

export function assertAttachmentTypeExists(
	type: AttachmentType | null,
): asserts type is AttachmentType {
	if (!type) {
		throw new Error(ATTACHMENT_ERRORS.TYPE_NOT_FOUND);
	}
}

export function assertAttachmentTypeCanBeSelected(type: AttachmentType) {
	if (!type.isActive) {
		throw new Error(ATTACHMENT_ERRORS.TYPE_INACTIVE);
	}
}
