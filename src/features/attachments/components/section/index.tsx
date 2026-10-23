import { ButtonNew } from "@/shared/components/button-new";
import { EntityListAccordion } from "@/shared/components/entity-list-accordion";
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
						<AttachmentSectionContent
							attachment={attachment}
							canDelete={canDelete}
							onDelete={overlay.delete.open}
						/>
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
