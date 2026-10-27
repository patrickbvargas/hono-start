import { DownloadIcon, TrashIcon } from "lucide-react";
import { ContextMenuItem, DropdownMenuItem } from "@/shared/components/ui";

interface AttachmentActionsProps {
	presentation?: "dropdown" | "context";
	canDownload: boolean;
	canDelete: boolean;
	onDownload: () => void;
	onDelete: () => void;
}

export function AttachmentActions({
	presentation = "dropdown",
	canDownload,
	canDelete,
	onDownload,
	onDelete,
}: AttachmentActionsProps) {
	const Item = presentation === "context" ? ContextMenuItem : DropdownMenuItem;
	return (
		<>
			<Item disabled={!canDownload} onClick={onDownload}>
				<DownloadIcon size={16} />
				Baixar
			</Item>
			{canDelete && (
				<Item variant="destructive" onClick={onDelete}>
					<TrashIcon size={16} />
					Excluir
				</Item>
			)}
		</>
	);
}
