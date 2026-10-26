import { Link } from "@tanstack/react-router";
import { AttachmentSection } from "@/features/attachments";
import { EntityAuditHistory } from "@/features/audit-logs";
import { EntityStatus } from "@/shared/components/entity-status";
import {
	EntityWorkspace,
	EntityWorkspaceHistory,
} from "@/shared/components/entity-workspace";
import { useFeeWorkspace } from "../../hooks/use-workspace";
import {
	type FeeWorkspaceSearch,
	feeWorkspaceSearchSchema,
} from "../../schemas/workspace";
import { feeSearchDefaults } from "../../utils/default";
import { FeeDelete } from "../delete";
import { FeeOverview } from "../details/overview";
import { FeeForm } from "../form";
import { FeeRestore } from "../restore";

interface FeeWorkspaceProps {
	id: number;
	search: FeeWorkspaceSearch;
	onTabChange: (tab: FeeWorkspaceSearch["tab"]) => void;
	onDeleted: () => void;
}
export function FeeWorkspace({
	id,
	search,
	onTabChange,
	onDeleted,
}: FeeWorkspaceProps) {
	const { fee, overlay, canEdit, canDelete, canRestore, canReadAttachments } =
		useFeeWorkspace(id);
	return (
		<EntityWorkspace
			title="Recebimento"
			identity={`${fee.contractProcessNumber} • ${fee.revenueType}`}
			subtitle={`#${id}`}
			status={
				<EntityStatus
					isActive={fee.isActive}
					isSoftDeleted={fee.isSoftDeleted}
				/>
			}
			returnLink={
				<Link to="/honorarios" search={search.returnTo ?? feeSearchDefaults}>
					Voltar para recebimentos
				</Link>
			}
			tab={
				search.tab === "attachments" && !canReadAttachments
					? "overview"
					: search.tab
			}
			onTabChange={(tab) =>
				onTabChange(feeWorkspaceSearchSchema.shape.tab.parse(tab))
			}
			onEdit={canEdit ? () => overlay.edit.open(id) : undefined}
			onDelete={canDelete ? () => overlay.delete.open(id) : undefined}
			onRestore={canRestore ? () => overlay.restore.open(id) : undefined}
			sections={[
				{
					value: "overview",
					label: "Visão geral",
					content: <FeeOverview id={id} section="overview" />,
				},

				{
					value: "finance",
					label: "Financeiro",
					content: <FeeOverview id={id} section="finance" />,
				},
				...(canReadAttachments
					? [
							{
								value: "attachments",
								label: "Anexos",
								expanded: true,
								content: (
									<AttachmentSection
										ownerId={id}
										ownerKind="fee"
										layout="expanded"
										canUpload={!fee.isSoftDeleted}
									/>
								),
							},
						]
					: []),
				{
					value: "history",
					label: "Histórico",
					content: (
						<EntityWorkspaceHistory
							createdAt={fee.createdAt}
							updatedAt={fee.updatedAt}
						>
							<EntityAuditHistory entityType="Fee" entityId={id} />
						</EntityWorkspaceHistory>
					),
				},
			]}
		>
			{overlay.edit.render((selectedId, state) => (
				<FeeForm id={selectedId} state={state} onSuccess={state.close} />
			))}
			{overlay.delete.render((selectedId, state) => (
				<FeeDelete
					id={selectedId}
					state={state}
					onSuccess={() => {
						state.close();
						onDeleted();
					}}
				/>
			))}
			{overlay.restore.render((selectedId, state) => (
				<FeeRestore id={selectedId} state={state} onSuccess={state.close} />
			))}
		</EntityWorkspace>
	);
}
