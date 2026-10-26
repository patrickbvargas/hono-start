import * as React from "react";
import { DataCardList } from "@/shared/components/data-card-list";
import { EntityActions } from "@/shared/components/entity-actions";
import type { DetailFieldItem } from "@/shared/components/entity-fields";
import { EntityStatus } from "@/shared/components/entity-status";
import { Pagination } from "@/shared/components/pagination";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import type { ExpenseSummary } from "../../schemas/model";
import { getExpenseLifecycleActions } from "../../utils/lifecycle-actions";

interface ExpenseListProps {
	canManageLifecycle?: boolean;
	data: QueryPaginatedReturnType<ExpenseSummary>;
	onOpenPage?: (id: EntityId) => void;
	onView?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onDelete?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

export const ExpenseList = ({
	canManageLifecycle = false,
	data,
	onOpenPage,
	onView,
	onEdit,
	onDelete,
	onRestore,
}: ExpenseListProps) => {
	const { data: items, total } = data;

	const renderCardFields = React.useCallback(
		(expense: ExpenseSummary): DetailFieldItem[] => [
			{ term: "Data", definition: formatter.calendarDate(expense.expenseDate) },
			{
				term: "Valor",
				definition: (
					<SensitiveValue>{formatter.currency(expense.amount)}</SensitiveValue>
				),
			},
			{ term: "Descrição", definition: expense.notes || "—" },
			{
				term: "Situação",
				definition: (
					<EntityStatus
						isActive={expense.isActive}
						isSoftDeleted={expense.isSoftDeleted}
					/>
				),
			},
			{ term: "Criado em", definition: formatter.date(expense.createdAt) },
		],
		[],
	);

	const renderCardActions = React.useCallback(
		(expense: ExpenseSummary) => {
			const actions = getExpenseLifecycleActions({
				canManageLifecycle,
				isSoftDeleted: expense.isSoftDeleted,
			});

			return (
				<EntityActions
					onOpenPage={onOpenPage ? () => onOpenPage(expense.id) : undefined}
					viewPermission="org:expenses:read"
					editPermission="org:expenses:update"
					restorePermission="org:expenses:restore"
					deletePermission="org:expenses:delete"
					canEdit={actions.canEdit}
					canRestore={actions.canRestore}
					canDelete={actions.canDelete}
					onView={() => onView?.(expense.id)}
					onEdit={() => onEdit?.(expense.id)}
					onRestore={() => onRestore?.(expense.id)}
					onDelete={() => onDelete?.(expense.id)}
				/>
			);
		},
		[canManageLifecycle, onOpenPage, onDelete, onEdit, onRestore, onView],
	);

	return (
		<DataCardList
			data={items}
			getRowKey={(expense) => expense.id}
			renderTitle={(expense) => expense.category}
			renderFields={renderCardFields}
			renderActions={renderCardActions}
			onCardAction={(expense) => (onOpenPage ?? onView)?.(expense.id)}
			footerContent={<Pagination totalRecords={total} />}
		/>
	);
};
