import type {
	AttachmentFormInput,
	AttachmentOwnerInput,
} from "../schemas/form";

export type AttachmentFormValues = AttachmentFormInput;

export function defaultAttachmentCreateValues(
	owner: AttachmentOwnerInput,
): AttachmentFormValues {
	return {
		...owner,
		file: null,
	};
}
