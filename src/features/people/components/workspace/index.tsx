import { Link } from "@tanstack/react-router";
import { AttachmentSection } from "@/features/attachments";
import { EntityAuditHistory } from "@/features/audit-logs";
import { EntityStatus } from "@/shared/components/entity-status";
import {
	EntityWorkspace,
	EntityWorkspaceHistory,
} from "@/shared/components/entity-workspace";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import { usePersonWorkspace } from "../../hooks/use-workspace";
import {
	type PersonWorkspaceSearch,
	personWorkspaceSearchSchema,
} from "../../schemas/workspace";
import { personSearchDefaults } from "../../utils/default";
import { PersonDelete } from "../delete";
import { PersonOverview, PersonProfessional } from "../details/overview";
import { PersonFinance } from "../finance";
import { PersonForm } from "../form";
import { PersonRestore } from "../restore";

interface PersonWorkspaceProps {
	id: number;
	search: PersonWorkspaceSearch;
	onTabChange: (tab: PersonWorkspaceSearch["tab"]) => void;
	onDeleted: () => void;
}
export function PersonWorkspace({
	id,
	search,
	onTabChange,
	onDeleted,
}: PersonWorkspaceProps) {
	const accessSession = useLoggedUserSession();
	const canReadAttachments = hasPermission(
		accessSession,
		"org:attachments:read",
	);
	const { person, overlay, canEdit, canDelete, canRestore, canReadFinance } =
		usePersonWorkspace(id);
	return (
		<EntityWorkspace
			title="Pessoa"
			identity={person.fullName}
			subtitle={`#${id}`}
			status={
				<EntityStatus
					isActive={person.isActive}
					isSoftDeleted={person.isSoftDeleted}
				/>
			}
			returnLink={
				<Link to="/pessoas" search={search.returnTo ?? personSearchDefaults}>
					Voltar para pessoas
				</Link>
			}
			tab={
				(search.tab === "attachments" && !canReadAttachments) ||
				(search.tab === "finance" && !canReadFinance)
					? "overview"
					: search.tab
			}
			onTabChange={(tab) =>
				onTabChange(personWorkspaceSearchSchema.shape.tab.parse(tab))
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
						<div className="h-full min-h-80 w-full">
							<div className="flex h-full min-h-0 flex-col gap-6 [&>section:first-child]:shrink-0">
								<PersonOverview id={id} section="overview" />
								<PersonProfessional id={id} />
							</div>
						</div>
					),
				},
				...(canReadFinance
					? [
							{
								value: "finance",
								label: "Financeiro",
								content: <PersonFinance id={id} />,
							},
						]
					: []),
				{
					value: "contact",
					label: "Contato",
					content: <PersonOverview id={id} section="contact" />,
				},
				...(canReadAttachments
					? [
							{
								value: "attachments",
								label: "Anexos",
								expanded: true,
								content: (
									<AttachmentSection
										canUpload={
											!person.isSoftDeleted &&
											hasPermission(accessSession, "org:people:update")
										}
										layout="expanded"
										ownerId={id}
										ownerKind="person"
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
							createdAt={person.createdAt}
							updatedAt={person.updatedAt}
						>
							<EntityAuditHistory entityType="Person" entityId={id} />
						</EntityWorkspaceHistory>
					),
				},
			]}
		>
			{overlay.edit.render((selectedId, state) => (
				<PersonForm id={selectedId} state={state} onSuccess={state.close} />
			))}
			{overlay.delete.render((selectedId, state) => (
				<PersonDelete
					id={selectedId}
					state={state}
					onSuccess={() => {
						state.close();
						onDeleted();
					}}
				/>
			))}
			{overlay.restore.render((selectedId, state) => (
				<PersonRestore id={selectedId} state={state} onSuccess={state.close} />
			))}
		</EntityWorkspace>
	);
}
