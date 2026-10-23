import { DownloadIcon, TrashIcon } from "lucide-react";
import { EntityFields } from "@/shared/components/entity-fields";
import {
	Button,
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
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
			<TooltipProvider>
				<div className="flex justify-end gap-2">
					<Tooltip>
						<TooltipTrigger
							render={
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
								/>
							}
						>
							<DownloadIcon size={16} />
						</TooltipTrigger>
						<TooltipContent>Baixar</TooltipContent>
					</Tooltip>
					{canDelete ? (
						<Tooltip>
							<TooltipTrigger
								render={
									<Button
										size="icon-sm"
										variant="destructive"
										onClick={() => onDelete(attachment.id)}
										aria-label={`Excluir ${attachment.fileName}`}
										title={`Excluir ${attachment.fileName}`}
									/>
								}
							>
								<TrashIcon size={16} />
							</TooltipTrigger>
							<TooltipContent>Excluir</TooltipContent>
						</Tooltip>
					) : null}
				</div>
			</TooltipProvider>
		</div>
	);
}
