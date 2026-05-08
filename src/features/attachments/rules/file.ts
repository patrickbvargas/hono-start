import { ATTACHMENT_ERRORS } from "../constants/errors";
import {
	ATTACHMENT_ALLOWED_MIME_TYPE_BY_VALUE,
	ATTACHMENT_MAX_FILE_SIZE_BYTES,
} from "../constants/values";

type AttachmentTypeValue = keyof typeof ATTACHMENT_ALLOWED_MIME_TYPE_BY_VALUE;

interface AttachmentFileRuleInput {
	fileName: string;
	fileSize: number;
	mimeType: string;
}

function getAttachmentTypeFromExtension(
	fileName: string,
): AttachmentTypeValue | null {
	const extension = fileName.split(".").pop()?.trim().toLowerCase();

	if (extension === "pdf") {
		return "PDF";
	}

	if (extension === "jpg" || extension === "jpeg") {
		return "JPG";
	}

	if (extension === "png") {
		return "PNG";
	}

	return null;
}

function getAttachmentTypeFromMimeType(
	mimeType: string,
): AttachmentTypeValue | null {
	const normalizedMimeType = mimeType.trim().toLowerCase();

	for (const [type, mimeTypes] of Object.entries(
		ATTACHMENT_ALLOWED_MIME_TYPE_BY_VALUE,
	)) {
		if (mimeTypes.includes(normalizedMimeType as never)) {
			return type as AttachmentTypeValue;
		}
	}

	return null;
}

export function assertAttachmentFileAccepted({
	fileName,
	fileSize,
	mimeType,
}: AttachmentFileRuleInput): AttachmentTypeValue {
	const inferredType =
		getAttachmentTypeFromMimeType(mimeType) ??
		getAttachmentTypeFromExtension(fileName);

	if (!inferredType) {
		throw new Error(ATTACHMENT_ERRORS.INVALID_FILE_TYPE);
	}

	if (fileSize > ATTACHMENT_MAX_FILE_SIZE_BYTES) {
		throw new Error(ATTACHMENT_ERRORS.FILE_TOO_LARGE);
	}

	return inferredType;
}

export function assertAttachmentTypeMatchesFile({
	type,
	...file
}: AttachmentFileRuleInput & {
	type: string;
}) {
	const inferredType = assertAttachmentFileAccepted(file);

	if (type !== inferredType) {
		throw new Error(ATTACHMENT_ERRORS.TYPE_MISMATCH);
	}
}
