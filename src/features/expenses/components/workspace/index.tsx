import { Link } from "@tanstack/react-router";
import { AttachmentSection } from "@/features/attachments";
import { EntityAuditHistory } from "@/features/audit-logs";
import { EntityStatus } from "@/shared/components/entity-status";
import {
	EntityWorkspace,
	EntityWorkspaceHistory,
} from "@/shared/components/entity-workspace";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import { useExpenseWorkspace } from "../../hooks/use-workspace";
import {
	type ExpenseWorkspaceSearch,
	expenseWorkspaceSearchSchema,
} from "../../schemas/workspace";
import { expenseSearchDefaults } from "../../utils/default";
import { ExpenseDelete } from "../delete";
import { ExpenseOverview } from "../details/overview";
import { ExpenseForm } from "../form";
import { ExpenseRestore } from "../restore";

interface ExpenseWorkspaceProps {
	id: number;
	search: ExpenseWorkspaceSearch;
	onTabChange: (tab: ExpenseWorkspaceSearch["tab"]) => void;
	onDeleted: () => void;
}
export function ExpenseWorkspace({
	id,
	search,
	onTabChange,
	onDeleted,
}: ExpenseWorkspaceProps) {
	const accessSession = useLoggedUserSession();
	const canReadAttachments = hasPermission(
		accessSession,
		"org:attachments:read",
	);
	const { expense, overlay, canEdit, canDelete, canRestore } =
		useExpenseWorkspace(id);
	return (
		<EntityWorkspace
			title="Despesa"
			identity={expense.category}
			subtitle={`#${id}`}
			status={
				<EntityStatus
					isActive={expense.isActive}
					isSoftDeleted={expense.isSoftDeleted}
				/>
			}
			returnLink={
				<Link to="/despesas" search={search.returnTo ?? expenseSearchDefaults}>
					Voltar para despesas
				</Link>
			}
			tab={
				search.tab === "attachments" && !canReadAttachments
					? "overview"
					: search.tab
			}
			onTabChange={(tab) =>
				onTabChange(expenseWorkspaceSearchSchema.shape.tab.parse(tab))
			}
			onEdit={canEdit ? () => overlay.edit.open(id) : undefined}
			onDelete={canDelete ? () => overlay.delete.open(id) : undefined}
			onRestore={canRestore ? () => overlay.restore.open(id) : undefined}
			sections={[
				{
					value: "overview",
					label: "Visão geral",
					content: <ExpenseOverview id={id} section="overview" />,
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
											!expense.isSoftDeleted &&
											hasPermission(accessSession, "org:expenses:update")
										}
										layout="expanded"
										ownerId={id}
										ownerKind="expense"
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
							createdAt={expense.createdAt}
							updatedAt={expense.updatedAt}
						>
							<EntityAuditHistory entityType="Expense" entityId={id} />
						</EntityWorkspaceHistory>
					),
				},
			]}
		>
			{overlay.edit.render((selectedId, state) => (
				<ExpenseForm id={selectedId} state={state} onSuccess={state.close} />
			))}
			{overlay.delete.render((selectedId, state) => (
				<ExpenseDelete
					id={selectedId}
					state={state}
					onSuccess={() => {
						state.close();
						onDeleted();
					}}
				/>
			))}
			{overlay.restore.render((selectedId, state) => (
				<ExpenseRestore id={selectedId} state={state} onSuccess={state.close} />
			))}
		</EntityWorkspace>
	);
}
