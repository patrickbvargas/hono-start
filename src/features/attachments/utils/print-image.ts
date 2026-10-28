interface PrintAttachmentImageOptions {
	url: string;
	fileName: string;
	onError: () => void;
}

export function printAttachmentImage({
	url,
	fileName,
	onError,
}: PrintAttachmentImageOptions) {
	const frame = document.createElement("iframe");
	frame.title = `Impressão de ${fileName}`;
	frame.setAttribute("aria-hidden", "true");
	frame.tabIndex = -1;
	frame.style.cssText =
		"position:fixed;width:0;height:0;border:0;pointer-events:none";
	let active = true;
	const cleanup = () => {
		active = false;
		frame.onload = null;
		frame.remove();
	};
	const fail = () => {
		cleanup();
		onError();
	};
	frame.onload = () => {
		if (!active) {
			return;
		}
		frame.onload = null;
		const doc = frame.contentDocument;
		const printWindow = frame.contentWindow;
		if (!doc || !printWindow) {
			fail();
			return;
		}
		doc.title = fileName;
		const style = doc.createElement("style");
		style.textContent =
			"@page{margin:12mm}html,body{margin:0;padding:0}body{display:flex;align-items:center;justify-content:center}img{display:block;max-width:100%;max-height:95vh;object-fit:contain;break-inside:avoid}";
		doc.head.append(style);
		const image = doc.createElement("img");
		image.alt = fileName;
		image.onload = () => {
			if (!active) {
				return;
			}
			printWindow.addEventListener("afterprint", cleanup, { once: true });
			try {
				printWindow.focus();
				printWindow.print();
			} catch {
				fail();
			}
		};
		image.onerror = fail;
		image.src = url;
		doc.body.append(image);
	};
	document.body.append(frame);
	return cleanup;
}
