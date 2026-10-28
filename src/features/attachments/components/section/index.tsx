import { useId } from "react";
import { ButtonNew } from "@/shared/components/button-new";
import { SectionTitle } from "@/shared/components/section-title";
import { Button, ScrollArea } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import type { EntityId } from "@/shared/schemas/entity";
import { ATTACHMENT_MAX_OWNER_FILES } from "../../constants/values";
import { useAttachmentSection } from "../../hooks/use-section";
import type { AttachmentOwnerKind } from "../../schemas/form";
import { AttachmentDelete } from "../delete";
import { AttachmentForm } from "../form";
import { AttachmentSectionContent } from "./content";
import { AttachmentSectionSkeleton } from "./skeleton";

interface AttachmentSectionProps {
	canUpload?: boolean;
	layout?: "compact" | "expanded";
	className?: string;
	ownerId: EntityId;
	ownerKind: AttachmentOwnerKind;
}

export const AttachmentSection = ({
	canUpload = true,
	layout = "compact",
	className,
	ownerId,
	ownerKind,
}: AttachmentSectionProps) => {
	const headingId = useId();
	const { owner, attachments, error, isPending, canDelete, overlay, retry } =
		useAttachmentSection({ ownerId, ownerKind });

	const attachmentList = (
		<ul aria-label="Arquivos anexados" className="min-w-0 divide-y">
			{attachments.map((attachment) => (
				<li key={attachment.id} className="min-h-16 min-w-0 py-3">
					<AttachmentSectionContent
						attachment={attachment}
						canDelete={canDelete}
						onDelete={overlay.delete.open}
					/>
				</li>
			))}
		</ul>
	);

	return (
		<section
			aria-labelledby={headingId}
			className={cn(
				"flex min-w-0 flex-col gap-2",
				layout === "expanded" &&
					"max-h-full min-h-0 gap-4 rounded-xl border bg-card p-4 text-card-foreground",
				className,
			)}
		>
			<div className="flex shrink-0 items-start justify-between gap-3">
				<div className="flex items-center gap-2">
					<SectionTitle
						id={headingId}
						className={
							layout === "expanded"
								? "text-sm normal-case tracking-normal text-foreground leading-none"
								: undefined
						}
					>
						Anexos
					</SectionTitle>
					{!isPending && !error ? (
						<span className="text-xs tabular-nums text-muted-foreground">
							{attachments.length}
						</span>
					) : null}
				</div>
				{canUpload ? (
					<div className="shrink-0">
						<ButtonNew
							permission="org:attachments:upload"
							className="w-fit"
							disabled={
								!isPending &&
								!error &&
								attachments.length >= ATTACHMENT_MAX_OWNER_FILES
							}
							title={
								attachments.length >= ATTACHMENT_MAX_OWNER_FILES
									? `Limite de ${ATTACHMENT_MAX_OWNER_FILES} anexos atingido`
									: undefined
							}
							label="Anexar"
							variant="ghost"
							size="sm"
							onClick={() => overlay.create.open()}
						/>
					</div>
				) : null}
			</div>
			{isPending ? <AttachmentSectionSkeleton /> : null}

			{error ? (
				<div
					role="alert"
					className="flex min-h-16 flex-wrap items-center justify-between gap-2 rounded-md bg-muted/50 px-3 py-2"
				>
					<p className="text-sm text-destructive">
						Não foi possível carregar anexos.
					</p>
					<Button type="button" variant="outline" size="sm" onClick={retry}>
						Tentar novamente
					</Button>
				</div>
			) : null}

			{!isPending && !error && attachments.length === 0 ? (
				<p className="text-muted-foreground text-sm leading-5">
					Nenhum anexo cadastrado.
				</p>
			) : null}

			{!isPending && !error && attachments.length > 0 ? (
				<ScrollArea
					className={
						layout === "expanded"
							? "min-h-0 flex-auto"
							: "max-h-56 [&>[data-slot=scroll-area-viewport]]:max-h-56"
					}
				>
					{attachmentList}
				</ScrollArea>
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
