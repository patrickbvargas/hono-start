import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button, ScrollArea, Skeleton } from "@/shared/components/ui";
import { usePdfPreview } from "../../hooks/use-pdf-preview";
import { AttachmentZoomToolbar } from "./zoom-toolbar";

interface AttachmentPdfPreviewProps {
	url: string;
	fileName: string;
	onLoad: () => void;
	onError: () => void;
}

export function AttachmentPdfPreview(props: AttachmentPdfPreviewProps) {
	const pdf = usePdfPreview(props);
	return (
		<div ref={pdf.viewportRef} className="relative h-full w-full min-w-0">
			<ScrollArea className="h-full w-full">
				<div className="flex min-h-full w-max min-w-full justify-center px-2 pb-20 pt-2">
					<canvas
						ref={pdf.canvasRef}
						role="img"
						aria-label={`${props.fileName}, página ${pdf.pageNumber} de ${pdf.pageCount || "..."}`}
						className="shrink-0 self-start bg-white shadow-sm"
						style={{ visibility: pdf.isRendering ? "hidden" : "visible" }}
					/>
				</div>
			</ScrollArea>
			{pdf.isRendering && (
				<div
					role="status"
					aria-label="Carregando página"
					className="absolute inset-0 z-10 bg-muted/40"
				>
					<Skeleton className="h-full w-full rounded-md" />
					<span className="sr-only">Carregando página...</span>
				</div>
			)}
			{pdf.pageCount > 0 && (
				<AttachmentZoomToolbar
					label="Controles do PDF"
					{...pdf}
					fitLabel="Ajustar à largura"
				>
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						aria-label="Página anterior"
						disabled={pdf.pageNumber <= 1 || pdf.isRendering}
						onClick={pdf.previous}
					>
						<ChevronLeftIcon size={16} />
					</Button>
					<span
						className="min-w-12 text-center text-xs tabular-nums"
						aria-live="polite"
					>
						{pdf.pageNumber} de {pdf.pageCount}
					</span>
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						aria-label="Próxima página"
						disabled={pdf.pageNumber >= pdf.pageCount || pdf.isRendering}
						onClick={pdf.next}
					>
						<ChevronRightIcon size={16} />
					</Button>
					<span aria-hidden="true" className="mx-1 h-4 border-l" />
				</AttachmentZoomToolbar>
			)}
		</div>
	);
}
