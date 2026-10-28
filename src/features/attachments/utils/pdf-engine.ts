import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

const assets = import.meta.glob<string>(
	"/node_modules/pdfjs-dist/{cmaps,standard_fonts,wasm}/*",
	{ query: "?url", import: "default", eager: true },
);
const folders: Record<string, string> = {
	cMapUrl: "cmaps",
	standardFontDataUrl: "standard_fonts",
	wasmUrl: "wasm",
};

class PdfBinaryDataFactory {
	async fetch({ kind, filename }: { kind: string; filename: string }) {
		const url = assets[`/node_modules/pdfjs-dist/${folders[kind]}/${filename}`];
		if (!url) {
			throw new Error("PDF resource unavailable");
		}
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error("PDF resource unavailable");
		}
		return new Uint8Array(await response.arrayBuffer());
	}
}

export function loadAttachmentPdf(url: string) {
	GlobalWorkerOptions.workerSrc = workerUrl;
	return getDocument({
		url,
		useWorkerFetch: false,
		BinaryDataFactory: PdfBinaryDataFactory,
	});
}
