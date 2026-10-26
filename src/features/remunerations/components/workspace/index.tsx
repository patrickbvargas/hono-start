import { Link } from "@tanstack/react-router";
import { AttachmentSection } from "@/features/attachments";
import { EntityAuditHistory } from "@/features/audit-logs";
import { EntityStatus } from "@/shared/components/entity-status";
import {
	EntityWorkspace,
	EntityWorkspaceHistory,
} from "@/shared/components/entity-workspace";
import { useRemunerationWorkspace } from "../../hooks/use-workspace";
import {
	type RemunerationWorkspaceSearch,
	remunerationWorkspaceSearchSchema,
} from "../../schemas/workspace";
import { remunerationSearchDefaults } from "../../utils/default";
import { RemunerationDelete } from "../delete";
import { RemunerationOverview } from "../details/overview";
import { RemunerationForm } from "../form";
import { RemunerationRestore } from "../restore";

interface RemunerationWorkspaceProps {
	id: number;
	search: RemunerationWorkspaceSearch;
	onTabChange: (tab: RemunerationWorkspaceSearch["tab"]) => void;
	onDeleted: () => void;
}
export function RemunerationWorkspace({
	id,
	search,
	onTabChange,
	onDeleted,
}: RemunerationWorkspaceProps) {
	const {
		remuneration,
		overlay,
		canEdit,
		canDelete,
		canRestore,
		canReadAttachments,
	} = useRemunerationWorkspace(id);
	return (
		<EntityWorkspace
			title="Remuneração"
			identity={`${remuneration.employeeName} • ${remuneration.contractProcessNumber}`}
			subtitle={`#${id}`}
			status={
				<EntityStatus
					isActive={remuneration.isActive}
					isSoftDeleted={remuneration.isSoftDeleted}
				/>
			}
			returnLink={
				<Link
					to="/remuneracoes"
					search={search.returnTo ?? remunerationSearchDefaults}
				>
					Voltar para remunerações
				</Link>
			}
			tab={
				search.tab === "attachments" && !canReadAttachments
					? "overview"
					: search.tab
			}
			onTabChange={(tab) =>
				onTabChange(remunerationWorkspaceSearchSchema.shape.tab.parse(tab))
			}
			onEdit={canEdit ? () => overlay.edit.open(id) : undefined}
			onDelete={canDelete ? () => overlay.delete.open(id) : undefined}
			onRestore={canRestore ? () => overlay.restore.open(id) : undefined}
			sections={[
				{
					value: "overview",
					label: "Visão geral",
					content: <RemunerationOverview id={id} section="overview" />,
				},

				{
					value: "finance",
					label: "Financeiro",
					content: <RemunerationOverview id={id} section="finance" />,
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
										ownerKind="remuneration"
										layout="expanded"
										canUpload={
											!remuneration.isSoftDeleted &&
											!remuneration.parentFeeIsSoftDeleted
										}
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
							createdAt={remuneration.createdAt}
							updatedAt={remuneration.updatedAt}
						>
							<EntityAuditHistory entityType="Remuneration" entityId={id} />
						</EntityWorkspaceHistory>
					),
				},
			]}
		>
			{overlay.edit.render((selectedId, state) => (
				<RemunerationForm
					id={selectedId}
					state={state}
					onSuccess={state.close}
				/>
			))}
			{overlay.delete.render((selectedId, state) => (
				<RemunerationDelete
					id={selectedId}
					state={state}
					onSuccess={() => {
						state.close();
						onDeleted();
					}}
				/>
			))}
			{overlay.restore.render((selectedId, state) => (
				<RemunerationRestore
					id={selectedId}
					state={state}
					onSuccess={state.close}
				/>
			))}
		</EntityWorkspace>
	);
}
