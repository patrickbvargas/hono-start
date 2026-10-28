import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { useEffect, useRef, useState } from "react";

interface UsePdfPreviewOptions {
	url: string;
	onLoad: () => void;
	onError: () => void;
}

export function usePdfPreview({ url, onLoad, onError }: UsePdfPreviewOptions) {
	const viewportRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const callbacks = useRef({ onLoad, onError });
	callbacks.current = { onLoad, onError };
	const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
	const [pageNumber, setPageNumber] = useState(1);
	const [zoom, setZoom] = useState<number | null>(null);
	const [width, setWidth] = useState(0);
	const [percent, setPercent] = useState(100);
	const [isRendering, setIsRendering] = useState(true);
	const resetScroll = () => {
		const viewport = viewportRef.current?.querySelector<HTMLElement>(
			'[data-slot="scroll-area-viewport"]',
		);
		if (viewport) {
			viewport.scrollTop = 0;
			viewport.scrollLeft = 0;
		}
	};
	useEffect(() => {
		const element = viewportRef.current;
		if (!element) {
			return;
		}
		const measure = () => setWidth(element.getBoundingClientRect().width);
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(element);
		return () => observer.disconnect();
	}, []);
	useEffect(() => {
		let active = true;
		let task:
			| ReturnType<typeof import("../utils/pdf-engine").loadAttachmentPdf>
			| undefined;
		void import("../utils/pdf-engine")
			.then(async ({ loadAttachmentPdf }) => {
				if (!active) {
					return;
				}
				task = loadAttachmentPdf(url);
				const pdf = await task.promise;
				if (active) {
					setDocument(pdf);
				}
			})
			.catch(() => {
				if (active) {
					callbacks.current.onError();
				}
			});
		return () => {
			active = false;
			void task?.destroy().catch(() => {});
		};
	}, [url]);
	useEffect(() => {
		if (!document || !width) {
			return;
		}
		let active = true;
		let renderTask: RenderTask | undefined;
		setIsRendering(true);
		void document
			.getPage(pageNumber)
			.then(async (page) => {
				if (!active) {
					return;
				}
				const base = page.getViewport({ scale: 1 });
				const scale =
					zoom ?? Math.min(8, Math.max(0.1, (width - 16) / base.width));
				const viewport = page.getViewport({ scale });
				const density = Math.min(
					window.devicePixelRatio || 1,
					2,
					Math.sqrt(16_000_000 / (viewport.width * viewport.height)),
				);
				const buffer = window.document.createElement("canvas");
				buffer.width = Math.ceil(viewport.width * density);
				buffer.height = Math.ceil(viewport.height * density);
				renderTask = page.render({
					canvas: buffer,
					viewport,
					transform: [density, 0, 0, density, 0, 0],
				});
				try {
					await renderTask.promise;
					if (!active || !canvasRef.current) {
						return;
					}
					const canvas = canvasRef.current;
					canvas.width = buffer.width;
					canvas.height = buffer.height;
					canvas.style.width = `${viewport.width}px`;
					canvas.style.height = `${viewport.height}px`;
					const context = canvas.getContext("2d");
					if (!context) {
						throw new Error("Canvas unavailable");
					}
					context.drawImage(buffer, 0, 0);
					setPercent(Math.round(scale * 100));
					setIsRendering(false);
					callbacks.current.onLoad();
				} finally {
					buffer.width = 0;
					buffer.height = 0;
				}
			})
			.catch(() => {
				if (active) {
					callbacks.current.onError();
				}
			});
		return () => {
			active = false;
			renderTask?.cancel();
		};
	}, [document, pageNumber, zoom, width]);
	return {
		viewportRef,
		canvasRef,
		pageNumber,
		pageCount: document?.numPages ?? 0,
		percent,
		isRendering,
		canZoomOut: percent > 10,
		canZoomIn: percent < 800,
		zoomIn: () => setZoom(Math.min(8, percent / 100 + 0.25)),
		zoomOut: () => setZoom(Math.max(0.1, percent / 100 - 0.25)),
		original: () => setZoom(1),
		fit: () => setZoom(null),
		previous: () => {
			resetScroll();
			setPageNumber((page) => Math.max(1, page - 1));
		},
		next: () => {
			resetScroll();
			setPageNumber((page) => Math.min(document?.numPages ?? 1, page + 1));
		},
	};
}
