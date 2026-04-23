import { useQuery } from "@tanstack/react-query";
import { FileIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Button, Separator, Spinner } from "@/shared/components/ui";
import { useOverlay } from "@/shared/hooks/use-overlay";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import { isAdminSession, useLoggedUserSessionStore } from "@/shared/session";
import { getAttachmentsByOwnerQueryOptions } from "../../api/queries";
import {
	type AttachmentOwnerKind,
	getAttachmentOwnerInput,
} from "../../schemas/form";
import { AttachmentDelete } from "../delete";
import { AttachmentForm } from "../form";

interface AttachmentSectionProps {
	canUpload?: boolean;
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
	ownerId,
	ownerKind,
}: AttachmentSectionProps) => {
	const owner = getAttachmentOwnerInput({ ownerId, ownerKind });
	const { data, error, isPending } = useQuery(
		getAttachmentsByOwnerQueryOptions(owner),
	);
	const isAdmin = useLoggedUserSessionStore(isAdminSession);
	const { overlay } = useOverlay<EntityId>();

	return (
		<section className="flex flex-col gap-3">
			<div className="flex items-center justify-between gap-2">
				<h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
					Anexos
				</h3>
				{canUpload ? (
					<Button size="sm" onClick={() => overlay.create.open()}>
						<PlusIcon size={16} />
						Novo anexo
					</Button>
				) : null}
			</div>

			{isPending ? (
				<div className="flex items-center gap-2 rounded-md border px-3 py-3 text-sm text-muted-foreground">
					<Spinner />
					Carregando anexos...
				</div>
			) : null}

			{error ? (
				<p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive text-sm">
					{error instanceof Error
						? error.message
						: "Não foi possível carregar anexos."}
				</p>
			) : null}

			{!isPending && !error && (data?.length ?? 0) === 0 ? (
				<p className="rounded-md border border-dashed px-3 py-4 text-muted-foreground text-sm">
					Nenhum anexo cadastrado.
				</p>
			) : null}

			{!isPending && !error && (data?.length ?? 0) > 0 ? (
				<div className="rounded-md border">
					{data?.map((attachment, index) => (
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
							{index < (data?.length ?? 0) - 1 ? (
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
