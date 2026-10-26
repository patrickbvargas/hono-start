import { useSearch } from "@tanstack/react-router";
import * as React from "react";
import { AttachmentSectionFallback } from "@/features/attachments";
import { EntityActions } from "@/shared/components/entity-actions";
import { EntityDetail } from "@/shared/components/entity-detail";
import { NavigationLink } from "@/shared/components/navigation-link";
import { Skeleton } from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import type { OverlayState } from "@/shared/types/overlay";
import { useExpense } from "../../hooks/use-data";
import { expenseSearchSchema } from "../../schemas/search";
import { getExpenseLifecycleActions } from "../../utils/lifecycle-actions";
import { ExpenseOverview } from "./overview";

interface ExpenseDetailsProps {
	canManageLifecycle?: boolean;
	id: EntityId;
	onDelete?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
	state: OverlayState;
}

export const ExpenseDetails = ({
	canManageLifecycle = false,
	id,
	onDelete,
	onEdit,
	onRestore,
	state,
}: ExpenseDetailsProps) => {
	return (
		<EntityDetail.Root key={id} state={state}>
			<React.Suspense fallback={<ExpenseDetailsFallback />}>
				<ExpenseDetailsContent
					canManageLifecycle={canManageLifecycle}
					id={id}
					onDelete={onDelete}
					onEdit={onEdit}
					onRestore={onRestore}
				/>
			</React.Suspense>
		</EntityDetail.Root>
	);
};

interface ExpenseDetailsContentProps {
	canManageLifecycle: boolean;
	id: EntityId;
	onDelete?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

function ExpenseDetailsContent({
	canManageLifecycle,
	id,
	onDelete,
	onEdit,
	onRestore,
}: ExpenseDetailsContentProps) {
	const currentSearch = useSearch({ strict: false });
	const { expense } = useExpense(id);
	const actions = getExpenseLifecycleActions({
		canManageLifecycle,
		isSoftDeleted: expense.isSoftDeleted,
	});

	const workspaceLink = (
		<NavigationLink
			to="/despesas/$expenseId"
			params={{ expenseId: String(id) }}
			search={{
				tab: "overview",
				returnTo: expenseSearchSchema.parse(currentSearch),
			}}
			className="inline-flex items-center gap-1 text-xs font-medium"
		>
			Abrir página
		</NavigationLink>
	);

	return (
		<EntityDetail.Content>
			<EntityDetail.Header className="flex-row items-center justify-between gap-3">
				<EntityDetail.Title className="min-w-0 flex-1 truncate">{`${expense.category} • ${formatter.currency(expense.amount)}`}</EntityDetail.Title>
				<div className="hidden shrink-0 sm:block">{workspaceLink}</div>
				<EntityActions
					viewPermission="org:expenses:read"
					editPermission="org:expenses:update"
					restorePermission="org:expenses:restore"
					deletePermission="org:expenses:delete"
					canView={false}
					canEdit={actions.canEdit}
					canRestore={actions.canRestore}
					canDelete={actions.canDelete}
					onEdit={onEdit ? () => onEdit(id) : undefined}
					onRestore={onRestore ? () => onRestore(id) : undefined}
					onDelete={onDelete ? () => onDelete(id) : undefined}
				/>
			</EntityDetail.Header>
			<EntityDetail.Body>
				<div className="sm:hidden">{workspaceLink}</div>
				<ExpenseOverview id={id} />
			</EntityDetail.Body>
			<EntityDetail.Footer />
		</EntityDetail.Content>
	);
}

const ExpenseDetailsFallback = () => {
	const session = useLoggedUserSession();
	return (
		<EntityDetail.Content>
			<EntityDetail.SkeletonHeader withActions withPageLink />
			<EntityDetail.Body>
				<EntityDetail.SkeletonPageLink />
				<EntityDetail.SkeletonFields columns={2} rows={3} />
				<EntityDetail.Separator />
				<EntityDetail.Section title="Observações">
					<Skeleton className="h-5 w-full max-w-56" />
				</EntityDetail.Section>
				{hasPermission(session, "org:attachments:read") && (
					<>
						<EntityDetail.Separator />
						<AttachmentSectionFallback
							canUpload={
								hasPermission(session, "org:expenses:update") &&
								hasPermission(session, "org:attachments:upload")
							}
						/>
					</>
				)}
				<EntityDetail.Separator />
				<EntityDetail.Section title="Registro">
					<EntityDetail.SkeletonFields columns={2} rows={3} />
				</EntityDetail.Section>
			</EntityDetail.Body>
			<EntityDetail.Footer />
		</EntityDetail.Content>
	);
};
