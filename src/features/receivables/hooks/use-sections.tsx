import { AttachmentSection } from "@/features/attachments";
import { EntityAuditHistory } from "@/features/audit-logs";
import { EntityWorkspaceHistory } from "@/shared/components/entity-workspace";
import { ReceivableOverview } from "../components/details/overview";
import { ReceivableReceipts } from "../components/details/receipts";
import { useReceivableWorkspace } from "./use-workspace";
export function useReceivableSections(id: number) {
	const { receivable, canReadReceipts, canReadAttachments, canReadAudit } =
		useReceivableWorkspace(id);
	return [
		{
			value: "overview" as const,
			label: "Visão geral",
			content: <ReceivableOverview id={id} section="overview" />,
		},
		...(canReadReceipts
			? [
					{
						value: "receipts" as const,
						label: "Recebimentos",
						content: <ReceivableReceipts id={id} />,
					},
				]
			: []),
		...(canReadAttachments
			? [
					{
						value: "attachments" as const,
						label: "Anexos",
						expanded: true,
						content: (
							<AttachmentSection
								ownerId={id}
								ownerKind="receivable"
								canUpload={false}
								layout="expanded"
							/>
						),
					},
				]
			: []),
		{
			value: "history" as const,
			label: "Histórico",
			content: (
				<EntityWorkspaceHistory
					createdAt={receivable.createdAt}
					updatedAt={receivable.updatedAt}
				>
					{canReadAudit ? (
						<EntityAuditHistory entityType="Receivable" entityId={id} />
					) : null}
				</EntityWorkspaceHistory>
			),
		},
	];
}
