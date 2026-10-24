import { DownloadIcon, EllipsisVerticalIcon, TrashIcon } from "lucide-react";
import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import type { AttachmentSummary } from "../../schemas/model";
import { formatFileSize } from "../../utils/format";

interface AttachmentSectionContentProps {
	attachment: AttachmentSummary;
	canDelete: boolean;
	onDelete: (id: EntityId) => void;
}

export function AttachmentSectionContent({
	attachment,
	canDelete,
	onDelete,
}: AttachmentSectionContentProps) {
	return (
		<div className="flex min-w-0 items-start gap-3">
			<span
				className="flex h-10 w-11 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground"
				aria-hidden="true"
			>
				{attachment.typeValue}
			</span>
			<div className="min-w-0 flex-1">
				<p className="wrap-anywhere text-sm font-medium leading-5">
					{attachment.fileName}
				</p>
				<p className="mt-1 flex flex-wrap gap-x-1 text-xs text-muted-foreground">
					<span>
						<span className="sr-only">Tamanho: </span>
						{formatFileSize(attachment.fileSize)}
					</span>
					<span aria-hidden="true">·</span>
					<span>
						<span className="sr-only">Anexado em </span>
						{formatter.date(attachment.createdAt)}
					</span>
				</p>
			</div>
			<div className="flex shrink-0 items-center gap-1">
				<Button
					size="icon-sm"
					variant="ghost"
					disabled={!attachment.downloadUrl}
					onClick={() => {
						if (attachment.downloadUrl) {
							window.open(
								attachment.downloadUrl,
								"_blank",
								"noopener,noreferrer",
							);
						}
					}}
					aria-label={`Baixar ${attachment.fileName}`}
					title="Baixar arquivo"
				>
					<DownloadIcon size={16} />
				</Button>
				{canDelete ? (
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<Button
									size="icon-sm"
									variant="ghost"
									aria-label={`Ações de ${attachment.fileName}`}
									title="Mais ações"
								/>
							}
						>
							<EllipsisVerticalIcon size={16} />
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								variant="destructive"
								onClick={() => onDelete(attachment.id)}
							>
								<TrashIcon size={16} />
								Excluir
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				) : null}
			</div>
		</div>
	);
}
