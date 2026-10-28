import { cn } from "@/shared/lib/utils";
import { useImagePreview } from "../../hooks/use-image-preview";
import { AttachmentZoomToolbar } from "./zoom-toolbar";

interface AttachmentImagePreviewProps {
	url: string;
	fileName: string;
	onLoad: () => void;
	onError: () => void;
}

export function AttachmentImagePreview({
	url,
	fileName,
	onLoad,
	onError,
}: AttachmentImagePreviewProps) {
	const image = useImagePreview({ onLoad });
	return (
		<div
			ref={image.viewportRef}
			role="region"
			aria-label="Imagem ampliável. Use as setas para mover a imagem."
			tabIndex={0}
			onKeyDown={image.onKeyDown}
			className="relative h-full w-full overflow-hidden rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
		>
			<img
				src={url}
				alt={fileName}
				draggable={false}
				onLoad={image.onLoad}
				onError={onError}
				onPointerDown={image.onPointerDown}
				onPointerMove={image.onPointerMove}
				onPointerUp={image.onPointerUp}
				onPointerCancel={image.onPointerCancel}
				onLostPointerCapture={image.onPointerCancel}
				style={image.imageStyle}
				className={cn(
					"absolute left-1/2 top-1/2 h-full w-full max-w-none touch-none select-none object-contain",
					image.canPan &&
						(image.isDragging ? "cursor-grabbing" : "cursor-grab"),
				)}
			/>
			<AttachmentZoomToolbar label="Zoom da imagem" {...image} />
		</div>
	);
}
