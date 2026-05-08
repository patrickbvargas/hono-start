import { FileIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Button, Separator, Skeleton } from "@/shared/components/ui";
import { useOverlay } from "@/shared/hooks/use-overlay";
import { formatter } from "@/shared/lib/formatter";
import { cn } from "@/shared/lib/utils";
import type { EntityId } from "@/shared/schemas/entity";
import { isAdminSession, useLoggedUserSessionStore } from "@/shared/session";
import { useAttachments } from "../../hooks/use-data";
import {
	type AttachmentOwnerKind,
	getAttachmentOwnerInput,
} from "../../schemas/form";
import { AttachmentDelete } from "../delete";
import { AttachmentForm } from "../form";

interface AttachmentSectionProps {
	canUpload?: boolean;
	className?: string;
	ownerId: EntityId;
	ownerKind: AttachmentOwnerKind;
}

function formatFileSize(bytes: number) {
	if (bytes < 1024) {
		return `${bytes} B`;
	}

	if (bytes < 1024 * 1024) {
		return `${(bytes / 1024).toFixed(1)} KB`;
	}

	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const AttachmentSection = ({
	canUpload = true,
	className,
	ownerId,
	ownerKind,
}: AttachmentSectionProps) => {
	const owner = getAttachmentOwnerInput({ ownerId, ownerKind });
	const { attachments, error, isPending } = useAttachments(owner);
	const isAdmin = useLoggedUserSessionStore(isAdminSession);
	const { overlay } = useOverlay<EntityId>();

	return (
		<section className={cn("flex flex-col gap-3", className)}>
			{canUpload ? (
				<div className="flex justify-end">
					<Button size="sm" onClick={() => overlay.create.open()}>
						<PlusIcon size={16} />
						Novo anexo
					</Button>
				</div>
			) : null}

			{isPending ? (
				<div className="rounded-md border">
					<AttachmentSectionSkeleton />
				</div>
			) : null}

			{error ? (
				<p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive text-sm">
					{error instanceof Error
						? error.message
						: "Não foi possível carregar anexos."}
				</p>
			) : null}

			{!isPending && !error && attachments.length === 0 ? (
				<p className="rounded-md border border-dashed px-3 py-4 text-muted-foreground text-sm">
					Nenhum anexo cadastrado.
				</p>
			) : null}

			{!isPending && !error && attachments.length > 0 ? (
				<div className="rounded-md border">
					{attachments.map((attachment, index) => (
						<div key={attachment.id} className="px-3 py-3">
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0 space-y-1">
									<div className="flex items-center gap-2 text-sm font-medium">
										<FileIcon size={14} />
										<span className="truncate">{attachment.fileName}</span>
									</div>
									<p className="text-muted-foreground text-xs">
										{attachment.type} • {formatFileSize(attachment.fileSize)} •{" "}
										{formatter.date(attachment.createdAt)}
									</p>
								</div>
								<div className="flex shrink-0 items-center gap-2">
									<Button
										size="sm"
										variant="outline"
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
									>
										Abrir
									</Button>
									{isAdmin ? (
										<Button
											size="icon-sm"
											variant="destructive"
											onClick={() => overlay.delete.open(attachment.id)}
										>
											<Trash2Icon size={16} />
										</Button>
									) : null}
								</div>
							</div>
							{index < attachments.length - 1 ? (
								<Separator className="mt-3" />
							) : null}
						</div>
					))}
				</div>
			) : null}

			{overlay.create.render((state) => (
				<AttachmentForm owner={owner} state={state} onSuccess={state.close} />
			))}
			{overlay.delete.render((id, state) => (
				<AttachmentDelete id={id} state={state} onSuccess={state.close} />
			))}
		</section>
	);
};

function AttachmentSectionSkeleton() {
	const skeletonRows = [
		{
			key: "attachment-skeleton-primary",
			fileWidth: "w-40",
			metaWidth: "w-52",
			showSeparator: true,
		},
		{
			key: "attachment-skeleton-secondary",
			fileWidth: "w-32",
			metaWidth: "w-44",
			showSeparator: false,
		},
	];

	return (
		<div className="px-3 py-3">
			<div className="flex flex-col gap-3">
				{skeletonRows.map((row) => (
					<div key={row.key}>
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0 flex-1 space-y-2">
								<div className="flex items-center gap-2">
									<Skeleton className="h-4 w-4 rounded-sm" />
									<Skeleton className={cn("h-4 rounded-sm", row.fileWidth)} />
								</div>
								<Skeleton className={cn("h-3 rounded-sm", row.metaWidth)} />
							</div>
							<div className="flex shrink-0 items-center gap-2">
								<Skeleton className="h-8 w-16 rounded-md" />
								<Skeleton className="h-8 w-8 rounded-md" />
							</div>
						</div>
						{row.showSeparator ? <Separator className="mt-3" /> : null}
					</div>
				))}
			</div>
		</div>
	);
}
