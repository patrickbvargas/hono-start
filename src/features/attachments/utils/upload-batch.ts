import {
	type AttachmentBatchFormInput,
	type AttachmentBatchUploadInput,
	attachmentBatchFormInputSchema,
	attachmentBatchUploadInputSchema,
} from "../schemas/form";
import { buildAttachmentUploadInput } from "./upload";

interface UploadAttachmentBatchOptions {
	input: AttachmentBatchFormInput;
	upload: (input: AttachmentBatchUploadInput) => Promise<void>;
	onProgress: (index: number, total: number) => void;
}

export async function uploadAttachmentBatch({
	input,
	upload,
	onProgress,
}: UploadAttachmentBatchOptions) {
	const parsed = attachmentBatchFormInputSchema.parse(input);
	const files: AttachmentBatchUploadInput["files"] = [];
	for (const [index, file] of parsed.files.entries()) {
		onProgress(index + 1, parsed.files.length);
		files.push(await buildAttachmentUploadInput({ ...parsed, file }, null));
	}
	const data = attachmentBatchUploadInputSchema.parse({ ...parsed, files });
	await upload(data);
}
