import type {
	AttachmentBatchFormInput,
	AttachmentOwnerInput,
} from "../schemas/form";

export type AttachmentFormValues = AttachmentBatchFormInput;

export function defaultAttachmentCreateValues(
	owner: AttachmentOwnerInput,
): AttachmentFormValues {
	return {
		...owner,
		files: [],
	};
}
