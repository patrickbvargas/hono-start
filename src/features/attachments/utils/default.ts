import type {
	AttachmentOwnerInput,
	AttachmentUploadInput,
} from "../schemas/form";

export function defaultAttachmentCreateValues(
	owner: AttachmentOwnerInput,
): AttachmentUploadInput {
	return {
		...owner,
		type: "",
		fileName: "",
		mimeType: "",
		fileSize: 0,
		fileBase64: "",
		isActive: true,
	};
}
