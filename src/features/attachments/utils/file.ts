import { ATTACHMENT_ERRORS } from "../constants/errors";
import { assertAttachmentFileAccepted } from "../rules/file";

export function inferAttachmentTypeFromFile(params: {
	fileName: string;
	mimeType: string;
}) {
	try {
		return assertAttachmentFileAccepted({
			fileName: params.fileName,
			mimeType: params.mimeType,
			fileSize: 0,
		});
	} catch (error) {
		if (
			error instanceof Error &&
			error.message === ATTACHMENT_ERRORS.INVALID_FILE_TYPE
		) {
			return null;
		}

		throw error;
	}
}
