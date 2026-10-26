import { Link } from "@tanstack/react-router";
import { AttachmentSection } from "@/features/attachments";
import { EntityAuditHistory } from "@/features/audit-logs";
import { RelatedContractAlerts } from "@/features/pending-work";
import { EntityStatus } from "@/shared/components/entity-status";
import {
	EntityWorkspace,
	EntityWorkspaceHistory,
} from "@/shared/components/entity-workspace";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import { useEmployeeWorkspace } from "../../hooks/use-workspace";
import {
	type EmployeeWorkspaceSearch,
	employeeWorkspaceSearchSchema,
} from "../../schemas/workspace";
import { employeeSearchDefaults } from "../../utils/default";
import { EmployeeDelete } from "../delete";
import { EmployeeOverview } from "../details/overview";
import { EmployeeForm } from "../form";
import { EmployeeRestore } from "../restore";

interface EmployeeWorkspaceProps {
	id: number;
	search: EmployeeWorkspaceSearch;
	onTabChange: (tab: EmployeeWorkspaceSearch["tab"]) => void;
	onDeleted: () => void;
}
export function EmployeeWorkspace({
	id,
	search,
	onTabChange,
	onDeleted,
}: EmployeeWorkspaceProps) {
	const accessSession = useLoggedUserSession();
	const canReadAttachments = hasPermission(
		accessSession,
		"org:attachments:read",
	);
	const { employee, overlay, canEdit, canDelete, canRestore } =
		useEmployeeWorkspace(id);
	return (
		<EntityWorkspace
			title="Colaborador"
			identity={employee.fullName}
			subtitle={`#${id}`}
			status={
				<EntityStatus
					isActive={employee.isActive}
					isSoftDeleted={employee.isSoftDeleted}
				/>
			}
			returnLink={
				<Link
					to="/colaboradores"
					search={search.returnTo ?? employeeSearchDefaults}
				>
					Voltar para colaboradores
				</Link>
			}
			tab={
				search.tab === "attachments" && !canReadAttachments
					? "overview"
					: search.tab
			}
			onTabChange={(tab) =>
				onTabChange(employeeWorkspaceSearchSchema.shape.tab.parse(tab))
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
								<EmployeeOverview id={id} section="overview" />
								<RelatedContractAlerts kind="employee" id={id} />
							</div>
						</div>
					),
				},
				{
					value: "finance",
					label: "Financeiro",
					content: <EmployeeOverview id={id} section="finance" />,
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
											!employee.isSoftDeleted &&
											hasPermission(accessSession, "org:employees:update")
										}
										layout="expanded"
										ownerId={id}
										ownerKind="employee"
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
							createdAt={employee.createdAt}
							updatedAt={employee.updatedAt}
						>
							<EntityAuditHistory entityType="Employee" entityId={id} />
						</EntityWorkspaceHistory>
					),
				},
			]}
		>
			{overlay.edit.render((selectedId, state) => (
				<EmployeeForm id={selectedId} state={state} onSuccess={state.close} />
			))}
			{overlay.delete.render((selectedId, state) => (
				<EmployeeDelete
					id={selectedId}
					state={state}
					onSuccess={() => {
						state.close();
						onDeleted();
					}}
				/>
			))}
			{overlay.restore.render((selectedId, state) => (
				<EmployeeRestore
					id={selectedId}
					state={state}
					onSuccess={state.close}
				/>
			))}
		</EntityWorkspace>
	);
}
