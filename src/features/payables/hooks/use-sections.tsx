import { AttachmentSection } from "@/features/attachments";
import { EntityAuditHistory } from "@/features/audit-logs";
import { EntityWorkspaceHistory } from "@/shared/components/entity-workspace";
import { PayableOverview } from "../components/details/overview";
import { PayablePayments } from "../components/details/payments";
import { usePayableWorkspace } from "./use-workspace";
export function usePayableSections(id: number) {
	const { payable, canReadPayments, canReadAttachments, canReadAudit } =
		usePayableWorkspace(id);
	return [
		{
			value: "overview" as const,
			label: "Visão geral",
			content: <PayableOverview id={id} section="overview" />,
		},
		...(canReadPayments
			? [
					{
						value: "payments" as const,
						label: "Pagamentos",
						content: <PayablePayments id={id} />,
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
								ownerKind="payable"
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
					createdAt={payable.createdAt}
					updatedAt={payable.updatedAt}
				>
					{canReadAudit ? (
						<EntityAuditHistory entityType="Payable" entityId={id} />
					) : null}
				</EntityWorkspaceHistory>
			),
		},
	];
}
