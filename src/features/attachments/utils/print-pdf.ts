interface PrintAttachmentPdfOptions {
	url: string;
	fileName: string;
	onError: () => void;
}

export function printAttachmentPdf({
	url,
	fileName,
	onError,
}: PrintAttachmentPdfOptions) {
	const frame = document.createElement("iframe");
	frame.title = `Impressão de ${fileName}`;
	frame.setAttribute("aria-hidden", "true");
	frame.style.cssText =
		"position:fixed;width:0;height:0;border:0;pointer-events:none";
	frame.tabIndex = -1;
	const cleanup = () => {
		frame.onload = null;
		frame.remove();
	};
	frame.onload = () => {
		frame.onload = null;
		const printWindow = frame.contentWindow;
		if (!printWindow) {
			cleanup();
			onError();
			return;
		}
		printWindow.addEventListener("afterprint", cleanup, { once: true });
		try {
			printWindow.focus();
			printWindow.print();
		} catch {
			cleanup();
			onError();
		}
	};
	frame.src = url;
	document.body.append(frame);
	return cleanup;
}
