import { DownloadIcon, EyeIcon, PrinterIcon, TrashIcon } from "lucide-react";
import { ContextMenuItem, DropdownMenuItem } from "@/shared/components/ui";

interface AttachmentActionsProps {
	presentation?: "dropdown" | "context";
	canDownload: boolean;
	canDelete: boolean;
	onDownload: () => void;
	onDelete: () => void;
	onPreview?: () => void;
	onPrint?: () => void;
	canPrint?: boolean;
}

export function AttachmentActions({
	presentation = "dropdown",
	canDownload,
	canDelete,
	onDownload,
	onDelete,
	onPreview,
	onPrint,
	canPrint = true,
}: AttachmentActionsProps) {
	const Item = presentation === "context" ? ContextMenuItem : DropdownMenuItem;
	return (
		<>
			{onPreview && (
				<Item onClick={onPreview}>
					<EyeIcon size={16} />
					Visualizar
				</Item>
			)}
			<Item disabled={!canDownload} onClick={onDownload}>
				<DownloadIcon size={16} />
				Baixar
			</Item>
			{onPrint && (
				<Item disabled={!canPrint} onClick={onPrint}>
					<PrinterIcon size={16} />
					Imprimir
				</Item>
			)}
			{canDelete && (
				<Item variant="destructive" onClick={onDelete}>
					<TrashIcon size={16} />
					Excluir
				</Item>
			)}
		</>
	);
}
