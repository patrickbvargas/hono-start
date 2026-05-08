import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAppForm } from "@/shared/hooks/use-app-form";
import {
	getMutationErrorMessage,
	refreshEntityQueries,
} from "@/shared/lib/entity-management";
import { toast } from "@/shared/lib/toast";
import { createAttachmentMutationOptions } from "../api/mutations";
import { attachmentKeys } from "../api/queries";
import {
	type AttachmentFormInput,
	type AttachmentOwnerInput,
	attachmentFormInputSchema,
	attachmentUploadInputSchema,
	inferAttachmentTypeFromFile,
} from "../schemas/form";
import { defaultAttachmentCreateValues } from "../utils/default";

interface UseAttachmentFormOptions {
	onSuccess?: () => void;
	owner: AttachmentOwnerInput;
}

interface PreparedAttachmentFile {
	file: File;
	fileBase64: string;
	type: string;
}

export function useAttachmentForm({
	onSuccess,
	owner,
}: UseAttachmentFormOptions) {
	const queryClient = useQueryClient();
	const mutation = useMutation(createAttachmentMutationOptions());
	const [preparedFile, setPreparedFile] =
		useState<PreparedAttachmentFile | null>(null);
	const [isPreparingFile, setIsPreparingFile] = useState(false);
	const form = useAppForm({
		defaultValues: defaultAttachmentCreateValues(owner),
		validators: {
			onSubmit: attachmentFormInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				const parsedForm = attachmentFormInputSchema.parse(value);
				const parsed = attachmentUploadInputSchema.parse(
					await buildAttachmentUploadInput(parsedForm, preparedFile),
				);
				await mutation.mutateAsync({ data: parsed });
				toast.success("Anexo enviado com sucesso.");
				await refreshEntityQueries(queryClient, attachmentKeys.all);
				onSuccess?.();
			} catch (error) {
				toast.danger(getMutationErrorMessage(error));
			}
		},
	});

	return {
		form,
		isPending: mutation.isPending,
		isPreparingFile,
		handleFileChange: async (file: File | null) => {
			if (!file) {
				setPreparedFile(null);
				return;
			}

			setIsPreparingFile(true);

			try {
				const type =
					inferAttachmentTypeFromFile({
						fileName: file.name,
						mimeType: file.type,
					}) ?? "";
				const fileBase64 = await fileToBase64(file);

				setPreparedFile({
					file,
					fileBase64,
					type,
				});
			} finally {
				setIsPreparingFile(false);
			}
		},
	};
}

async function buildAttachmentUploadInput(
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
		type,
		fileName: value.file.name,
		mimeType: value.file.type,
		fileSize: value.file.size,
		fileBase64,
	};
}

async function fileToBase64(file: File) {
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
