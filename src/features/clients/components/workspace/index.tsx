import { Link } from "@tanstack/react-router";
import { AttachmentSection } from "@/features/attachments";
import { EntityAuditHistory } from "@/features/audit-logs";
import { RelatedContractAlerts } from "@/features/pending-work";
import { EntityStatus } from "@/shared/components/entity-status";
import {
	EntityWorkspace,
	EntityWorkspaceHistory,
} from "@/shared/components/entity-workspace";
import { useClientWorkspace } from "../../hooks/use-workspace";
import {
	type ClientWorkspaceSearch,
	clientWorkspaceSearchSchema,
} from "../../schemas/workspace";
import { clientSearchDefaults } from "../../utils/default";
import { ClientDelete } from "../delete";
import { ClientOverview } from "../details/overview";
import { ClientFinance } from "../finance";
import { ClientForm } from "../form";
import { ClientRestore } from "../restore";

interface ClientWorkspaceProps {
	id: number;
	search: ClientWorkspaceSearch;
	onTabChange: (tab: ClientWorkspaceSearch["tab"]) => void;
	onDeleted: () => void;
}
export function ClientWorkspace({
	id,
	search,
	onTabChange,
	onDeleted,
}: ClientWorkspaceProps) {
	const { client, overlay, canEdit, canDelete, canRestore, canReadFinance } =
		useClientWorkspace(id);
	return (
		<EntityWorkspace
			title="Cliente"
			identity={client.fullName}
			subtitle={`#${id}`}
			status={
				<EntityStatus
					isActive={client.isActive}
					isSoftDeleted={client.isSoftDeleted}
				/>
			}
			returnLink={
				<Link to="/clientes" search={search.returnTo ?? clientSearchDefaults}>
					Voltar para clientes
				</Link>
			}
			tab={search.tab}
			onTabChange={(tab) =>
				onTabChange(clientWorkspaceSearchSchema.shape.tab.parse(tab))
			}
			onEdit={canEdit ? () => overlay.edit.open(id) : undefined}
			onDelete={canDelete ? () => overlay.delete.open(id) : undefined}
			onRestore={canRestore ? () => overlay.restore.open(id) : undefined}
			sections={[
				{
					value: "overview",
					expanded: true,
					label: "Visão geral",
					content: (
						<div className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto [&>section:first-child]:shrink-0">
							<ClientOverview id={id} section="overview" />
							<RelatedContractAlerts kind="client" id={id} />
						</div>
					),
				},
				...(canReadFinance
					? [
							{
								value: "finance",
								label: "Financeiro",
								content: <ClientFinance id={id} />,
							},
						]
					: []),
				{
					value: "contact",
					label: "Contato",
					content: <ClientOverview id={id} section="contact" />,
				},
				{
					value: "attachments",
					label: "Anexos",
					expanded: true,
					content: (
						<AttachmentSection
							canUpload
							layout="expanded"
							ownerId={id}
							ownerKind="client"
						/>
					),
				},
				{
					value: "history",
					fullWidth: true,
					label: "Histórico",
					content: (
						<EntityWorkspaceHistory
							createdAt={client.createdAt}
							updatedAt={client.updatedAt}
						>
							<EntityAuditHistory entityType="Client" entityId={id} />
						</EntityWorkspaceHistory>
					),
				},
			]}
		>
			{overlay.edit.render((selectedId, state) => (
				<ClientForm id={selectedId} state={state} onSuccess={state.close} />
			))}
			{overlay.delete.render((selectedId, state) => (
				<ClientDelete
					id={selectedId}
					state={state}
					onSuccess={() => {
						state.close();
						onDeleted();
					}}
				/>
			))}
			{overlay.restore.render((selectedId, state) => (
				<ClientRestore id={selectedId} state={state} onSuccess={state.close} />
			))}
		</EntityWorkspace>
	);
}
