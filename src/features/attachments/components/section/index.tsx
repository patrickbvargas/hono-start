import { FileIcon } from "lucide-react";
import { ButtonNew } from "@/shared/components/button-new";
import { cn } from "@/shared/lib/utils";
import type { EntityId } from "@/shared/schemas/entity";
import { useAttachmentSection } from "../../hooks/use-section";
import type { AttachmentOwnerKind } from "../../schemas/form";
import { AttachmentDelete } from "../delete";
import { AttachmentForm } from "../form";
import { AttachmentSectionContent } from "./content";
import { AttachmentSectionSkeleton } from "./skeleton";

interface AttachmentSectionProps {
	canUpload?: boolean;
	className?: string;
	ownerId: EntityId;
	ownerKind: AttachmentOwnerKind;
}

export const AttachmentSection = ({
	canUpload = true,
	className,
	ownerId,
	ownerKind,
}: AttachmentSectionProps) => {
	const { owner, attachments, error, isPending, canDelete, overlay } =
		useAttachmentSection({ ownerId, ownerKind });

	return (
		<section className={cn("flex flex-col gap-3", className)}>
			{canUpload ? (
				<div className="flex">
					<ButtonNew
						permission="org:attachments:upload"
						className="w-fit"
						label="Novo anexo"
						variant="secondary"
						onClick={() => overlay.create.open()}
					/>
				</div>
			) : null}

			{isPending ? <AttachmentSectionSkeleton /> : null}

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
				<ul className="grid gap-3">
					{attachments.map((attachment) => (
						<li key={attachment.id} className="min-w-0 rounded-lg border p-3">
							<div className="mb-3 flex min-w-0 items-start gap-2">
								<FileIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
								<p className="min-w-0 wrap-break-word text-sm font-medium">
									{attachment.fileName}
								</p>
							</div>
							<AttachmentSectionContent
								attachment={attachment}
								canDelete={canDelete}
								onDelete={overlay.delete.open}
							/>
						</li>
					))}
				</ul>
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
