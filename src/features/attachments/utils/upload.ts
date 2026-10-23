import type { AttachmentFormInput } from "../schemas/form";
import { inferAttachmentTypeFromFile } from "./file";

export interface PreparedAttachmentFile {
	file: File;
	fileBase64: string;
	type: string;
}

export async function buildAttachmentUploadInput(
	value: AttachmentFormInput,
	preparedFile: PreparedAttachmentFile | null,
) {
	if (!value.file) {
		return {
			...value,
			type: "",
			fileName: "",
			mimeType: "",
			fileSize: 0,
			fileBase64: "",
		};
	}

	const cachedPreparedFile =
		preparedFile?.file === value.file ? preparedFile : null;
	const fileBase64 = cachedPreparedFile
		? cachedPreparedFile.fileBase64
		: await fileToBase64(value.file);
	const type =
		cachedPreparedFile?.type ??
		inferAttachmentTypeFromFile({
			fileName: value.file.name,
			mimeType: value.file.type,
		}) ??
		"";

	return {
		clientId: value.clientId,
		employeeId: value.employeeId,
		contractId: value.contractId,
		expenseId: value.expenseId,
		type,
		fileName: value.file.name,
		mimeType: value.file.type,
		fileSize: value.file.size,
		fileBase64,
	};
}

export async function fileToBase64(file: File) {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();

		reader.onerror = () => {
			reject(reader.error ?? new Error("Não foi possível ler arquivo."));
		};

		reader.onload = () => {
			const result = reader.result;

			if (typeof result !== "string") {
				reject(new Error("Não foi possível ler arquivo."));
				return;
			}

			const [, base64 = ""] = result.split(",", 2);
			resolve(base64);
		};

		reader.readAsDataURL(file);
	});
}
