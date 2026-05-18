import { DownloadIcon, TrashIcon } from "lucide-react";
import { ButtonNew } from "@/shared/components/button-new";
import { EntityFields } from "@/shared/components/entity-fields";
import { EntityListAccordion } from "@/shared/components/entity-list-accordion";
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
				<div className="flex">
					<ButtonNew
						className="w-fit"
						label="Novo anexo"
						onClick={() => overlay.create.open()}
					/>
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
				<EntityListAccordion
					items={attachments}
					getKey={(attachment) => String(attachment.id)}
					getTitle={(attachment) => attachment.fileName}
					getSummary={(attachment) => attachment.fileName}
					openDescription={undefined}
					renderContent={(attachment) => (
						<div className="flex items-center justify-between gap-3">
							<EntityFields
								items={[
									{
										term: "Tamanho",
										definition: formatFileSize(attachment.fileSize),
									},
									{
										term: "Anexado em",
										definition: formatter.date(attachment.createdAt),
									},
								]}
								columns={2}
							/>
							<div className="flex justify-end gap-2">
								<Button
									size="icon-sm"
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
									aria-label={`Baixar ${attachment.fileName}`}
									title={`Baixar ${attachment.fileName}`}
								>
									<DownloadIcon size={16} />
								</Button>
								{isAdmin ? (
									<Button
										size="icon-sm"
										variant="destructive"
										onClick={() => overlay.delete.open(attachment.id)}
										aria-label={`Excluir ${attachment.fileName}`}
										title={`Excluir ${attachment.fileName}`}
									>
										<TrashIcon size={16} />
									</Button>
								) : null}
							</div>
						</div>
					)}
				/>
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
			showSeparator: true,
		},
		{
			key: "attachment-skeleton-secondary",
			fileWidth: "w-32",
			showSeparator: false,
		},
	];

	return (
		<div className="px-3 py-3">
			<div className="flex flex-col gap-3">
				{skeletonRows.map((row) => (
					<div key={row.key}>
						<div className="flex items-center justify-between gap-3 py-1">
							<Skeleton className={cn("h-4 rounded-sm", row.fileWidth)} />
							<Skeleton className="h-4 w-4 rounded-sm" />
						</div>
						{row.showSeparator ? <Separator className="mt-3" /> : null}
					</div>
				))}
			</div>
		</div>
	);
}
