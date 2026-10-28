import { DownloadIcon, EllipsisVerticalIcon } from "lucide-react";
import { useRef } from "react";
import {
	Button,
	ContextMenu,
	ContextMenuContent,
	ContextMenuTrigger,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import type { AttachmentSummary } from "../../schemas/model";
import { formatFileSize } from "../../utils/format";
import { AttachmentActions } from "./actions";

interface AttachmentSectionContentProps {
	attachment: AttachmentSummary;
	canDelete: boolean;
	onDelete: (id: EntityId) => void;
	onPreview: (trigger: HTMLElement) => void;
}

export function AttachmentSectionContent({
	attachment,
	canDelete,
	onDelete,
	onPreview,
}: AttachmentSectionContentProps) {
	const triggerRef = useRef<HTMLElement | null>(null);
	const previewButtonRef = useRef<HTMLButtonElement | null>(null);
	const download = () => {
		if (attachment.downloadUrl) {
			window.open(attachment.downloadUrl, "_blank", "noopener,noreferrer");
		}
	};
	const actions = (presentation: "dropdown" | "context") => (
		<AttachmentActions
			presentation={presentation}
			canDownload={!!attachment.downloadUrl}
			canDelete={canDelete}
			onDownload={download}
			onDelete={() => onDelete(attachment.id)}
			onPreview={() => {
				if (previewButtonRef.current) {
					onPreview(previewButtonRef.current);
				}
			}}
		/>
	);
	const content = (
		<div className="group/attachment flex min-w-0 items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/50 focus-within:bg-muted/50">
			<button
				ref={previewButtonRef}
				type="button"
				onClick={(event) => onPreview(event.currentTarget)}
				aria-label={`Visualizar ${attachment.fileName}`}
				className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
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
					<p className="mt-1 flex min-w-0 items-center gap-x-1 whitespace-nowrap text-xs text-muted-foreground">
						<span>
							<span className="sr-only">Tamanho: </span>
							{formatFileSize(attachment.fileSize)}
						</span>
						<span aria-hidden="true">·</span>
						<span>
							<span className="sr-only">Anexado em </span>
							{formatter.date(attachment.createdAt)}
						</span>
						<span aria-hidden="true">·</span>
						<span
							className="min-w-0 truncate"
							title={
								attachment.uploadedByName
									? `Enviado por ${attachment.uploadedByName}`
									: "Autor não informado"
							}
						>
							{attachment.uploadedByName
								? `Enviado por ${attachment.uploadedByName}`
								: "Autor não informado"}
						</span>
					</p>
				</div>
			</button>
			<div className="flex shrink-0 items-center gap-1">
				<Button
					size="icon-sm"
					variant="ghost"
					disabled={!attachment.downloadUrl}
					onClick={download}
					aria-label={`Baixar ${attachment.fileName}`}
					title="Baixar arquivo"
				>
					<DownloadIcon size={16} />
				</Button>
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
						{actions("dropdown")}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
	return (
		<ContextMenu>
			<ContextMenuTrigger
				render={content}
				tabIndex={0}
				aria-label={`Anexo ${attachment.fileName}`}
				ref={(element) => {
					triggerRef.current = element;
				}}
				onContextMenu={(event) => event.stopPropagation()}
				onKeyDown={(event) => {
					if (
						event.target === event.currentTarget &&
						(event.key === "ContextMenu" ||
							(event.shiftKey && event.key === "F10"))
					) {
						event.preventDefault();
						const rect = event.currentTarget.getBoundingClientRect();
						event.currentTarget.dispatchEvent(
							new MouseEvent("contextmenu", {
								bubbles: true,
								cancelable: true,
								clientX: rect.left + 16,
								clientY: rect.bottom,
							}),
						);
					}
				}}
			/>
			<ContextMenuContent finalFocus={() => triggerRef.current}>
				{actions("context")}
			</ContextMenuContent>
		</ContextMenu>
	);
}
