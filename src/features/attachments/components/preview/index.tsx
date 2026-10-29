import {
	ArrowUpRightIcon,
	DownloadIcon,
	EllipsisVerticalIcon,
	PrinterIcon,
	XIcon,
} from "lucide-react";
import type { RefObject } from "react";
import {
	Button,
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
	Skeleton,
} from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import { cn } from "@/shared/lib/utils";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useAttachmentPreview } from "../../hooks/use-preview";
import type { AttachmentSummary } from "../../schemas/model";
import { formatFileSize } from "../../utils/format";
import { AttachmentActions } from "../section/actions";
import { AttachmentImagePreview } from "./image";
import { AttachmentPdfPreview } from "./pdf";

interface AttachmentPreviewProps {
	attachment: AttachmentSummary;
	state: OverlayState;
	canDelete: boolean;
	onDelete: (id: EntityId) => void;
	triggerRef: RefObject<HTMLElement | null>;
	confirmationOpen?: boolean;
}

export function AttachmentPreview({
	attachment,
	state,
	canDelete,
	onDelete,
	triggerRef,
	confirmationOpen = false,
}: AttachmentPreviewProps) {
	const preview = useAttachmentPreview(attachment);
	return (
		<Dialog
			open={state.isOpen}
			modal={!confirmationOpen}
			onOpenChange={(open, details) => {
				if (confirmationOpen) {
					details.cancel();
					return;
				}
				state.onOpenChange(open);
			}}
		>
			<DialogContent
				portalClassName={confirmationOpen ? "z-40" : undefined}
				showCloseButton={false}
				finalFocus={() => triggerRef.current}
				className="flex h-dvh max-h-dvh w-full max-w-full rounded-none sm:h-[90dvh] sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100%-2rem)] sm:rounded-xl min-w-0 flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl"
			>
				<DialogHeader className="shrink-0 border-b px-4 py-3">
					<div className="flex min-w-0 items-center justify-between gap-3">
						<div className="min-w-0 space-y-1">
							<DialogTitle
								className="truncate leading-5"
								title={attachment.fileName}
							>
								{attachment.fileName}
							</DialogTitle>
							<DialogDescription className="text-xs leading-4">
								{attachment.typeValue} · {formatFileSize(attachment.fileSize)} ·{" "}
								{formatter.date(attachment.createdAt)}
								<span aria-hidden="true"> · </span>
								<span>
									{attachment.uploadedByName
										? `Enviado por ${attachment.uploadedByName}`
										: "Autor não informado"}
								</span>
							</DialogDescription>
						</div>
						<div className="flex shrink-0 items-center gap-1">
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								disabled={!attachment.downloadUrl}
								onClick={preview.download}
								aria-label="Baixar arquivo"
								title="Baixar arquivo"
							>
								<DownloadIcon size={16} />
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								disabled={preview.isLoading || !!preview.error || !preview.url}
								onClick={preview.print}
								aria-label="Imprimir arquivo"
								title="Imprimir arquivo"
							>
								<PrinterIcon size={16} />
							</Button>
							<DropdownMenu>
								<DropdownMenuTrigger
									render={
										<Button
											variant="ghost"
											size="icon-sm"
											aria-label="Ações do anexo"
										/>
									}
								>
									<EllipsisVerticalIcon size={16} />
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<AttachmentActions
										canDownload={!!attachment.downloadUrl}
										canDelete={canDelete}
										onDownload={preview.download}
										onPrint={preview.print}
										canPrint={
											!preview.isLoading && !preview.error && !!preview.url
										}
										onDelete={() => onDelete(attachment.id)}
									/>
								</DropdownMenuContent>
							</DropdownMenu>
							<DialogClose
								render={
									<Button
										variant="ghost"
										size="icon-sm"
										aria-label="Fechar visualização"
									/>
								}
							>
								<XIcon size={16} />
							</DialogClose>
						</div>
					</div>
				</DialogHeader>
				<div
					className="relative flex min-h-0 flex-1 items-center justify-center bg-muted/40 p-2 sm:p-4"
					aria-busy={preview.isLoading}
				>
					{preview.isLoading && (
						<div
							role="status"
							aria-label="Carregando anexo"
							className={cn(
								"absolute z-10",
								preview.isPdf ? "inset-0" : "inset-2 sm:inset-4",
							)}
						>
							<span className="sr-only">Carregando anexo...</span>
							<Skeleton className="h-full w-full rounded-md" />
						</div>
					)}
					{preview.error && (
						<div
							role="alert"
							className="flex flex-col items-center gap-3 p-4 text-center"
						>
							<p className="text-sm text-muted-foreground">{preview.error}</p>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={preview.retry}
							>
								Tentar novamente
							</Button>
						</div>
					)}
					{!preview.error &&
						preview.url &&
						(preview.isPdf ? (
							<AttachmentPdfPreview
								key={preview.url}
								url={preview.url}
								fileName={attachment.fileName}
								onError={preview.onRenderError}
								onLoad={preview.onRenderLoad}
							/>
						) : (
							<AttachmentImagePreview
								key={preview.url}
								url={preview.url}
								fileName={attachment.fileName}
								onError={preview.onRenderError}
								onLoad={preview.onRenderLoad}
							/>
						))}
				</div>
				<div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t px-4 py-2">
					<p className="text-xs text-muted-foreground">
						Se a visualização não aparecer, abra o arquivo em nova aba.
					</p>
					<Button
						type="button"
						variant="link"
						size="sm"
						className="gap-1 px-0 text-xs text-foreground underline underline-offset-4"
						disabled={!attachment.downloadUrl}
						onClick={preview.openInNewTab}
					>
						Abrir em nova aba
						<ArrowUpRightIcon aria-hidden="true" size={14} />
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
