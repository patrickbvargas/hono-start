import { MinusIcon, PlusIcon, ScanIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/shared/components/ui";

interface AttachmentZoomToolbarProps {
	label: string;
	percent: number;
	canZoomOut: boolean;
	canZoomIn: boolean;
	zoomIn: () => void;
	zoomOut: () => void;
	original: () => void;
	fit: () => void;
	fitLabel?: string;
	children?: ReactNode;
}

export function AttachmentZoomToolbar({
	label,
	percent,
	canZoomIn,
	canZoomOut,
	zoomIn,
	zoomOut,
	original,
	fit,
	fitLabel = "Ajustar à tela",
	children,
}: AttachmentZoomToolbarProps) {
	return (
		<div
			role="group"
			aria-label={label}
			className="absolute bottom-2 left-1/2 z-10 flex max-w-[calc(100%-1rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-1 rounded-lg border bg-background/95 p-1 shadow-sm"
		>
			{children}
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				aria-label="Diminuir zoom"
				disabled={!canZoomOut}
				onClick={zoomOut}
			>
				<MinusIcon size={16} />
			</Button>
			<output
				aria-label="Zoom atual"
				className="min-w-12 text-center text-xs tabular-nums"
			>
				{percent}%
			</output>
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				aria-label="Aumentar zoom"
				disabled={!canZoomIn}
				onClick={zoomIn}
			>
				<PlusIcon size={16} />
			</Button>
			<Button type="button" variant="ghost" size="sm" onClick={original}>
				100%
			</Button>
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				aria-label={fitLabel}
				title={fitLabel}
				onClick={fit}
			>
				<ScanIcon size={16} />
			</Button>
		</div>
	);
}
