import { useEffect, useRef, useState } from "react";
import { toast } from "@/shared/lib/toast";
import { ATTACHMENT_ERRORS } from "../constants/errors";
import type { AttachmentSummary } from "../schemas/model";
import { printAttachmentImage } from "../utils/print-image";
import { printAttachmentPdf } from "../utils/print-pdf";
import { useAttachmentFile } from "./use-data";

export function useAttachmentPreview(attachment: AttachmentSummary) {
	const { file, error, isFetching, refetch } = useAttachmentFile(attachment);
	const [source, setSource] = useState<{ file: Blob; url: string } | null>(
		null,
	);
	const [failedUrl, setFailedUrl] = useState<string | null>(null);
	const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
	const printCleanup = useRef<(() => void) | null>(null);
	useEffect(() => () => printCleanup.current?.(), []);

	useEffect(() => {
		if (!file) {
			return;
		}
		const url = URL.createObjectURL(file);
		setSource({ file, url });
		return () => URL.revokeObjectURL(url);
	}, [file]);

	const url = source?.file === file ? source?.url : null;
	const hasError = !!error || (!!url && failedUrl === url);
	return {
		print: () => {
			if (!url || hasError || loadedUrl !== url || !file) {
				return;
			}
			printCleanup.current?.();
			const print =
				file.type === "application/pdf"
					? printAttachmentPdf
					: printAttachmentImage;
			printCleanup.current = print({
				url,
				fileName: attachment.fileName,
				onError: () => toast.danger(ATTACHMENT_ERRORS.PRINT_FAILED),
			});
		},
		openInNewTab: () => {
			if (attachment.downloadUrl) {
				window.open(attachment.downloadUrl, "_blank", "noopener,noreferrer");
			}
		},
		download: () => {
			if (attachment.downloadUrl) {
				const link = document.createElement("a");
				link.href = attachment.downloadUrl;
				link.download = attachment.fileName;
				link.click();
			}
		},
		url,
		isPdf: file?.type === "application/pdf",
		isLoading: !hasError && (isFetching || !url || loadedUrl !== url),
		error: hasError
			? attachment.downloadUrl
				? ATTACHMENT_ERRORS.PREVIEW_FAILED
				: ATTACHMENT_ERRORS.PREVIEW_UNAVAILABLE
			: null,
		onRenderError: () => setFailedUrl(url ?? null),
		onRenderLoad: () => setLoadedUrl(url ?? null),
		retry: () => {
			setFailedUrl(null);
			setLoadedUrl(null);
			void refetch();
		},
	};
}
