import * as React from "react";
import { DataCardList } from "@/shared/components/data-card-list";
import { EntityActions } from "@/shared/components/entity-actions";
import type { DetailFieldItem } from "@/shared/components/entity-fields";
import { EntityStatus } from "@/shared/components/entity-status";
import { Pagination } from "@/shared/components/pagination";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import type { ExpenseSummary } from "../../schemas/model";
import { getExpenseLifecycleActions } from "../../utils/lifecycle-actions";

interface ExpenseListProps {
	canManageLifecycle?: boolean;
	data: QueryPaginatedReturnType<ExpenseSummary>;
	onView?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onDelete?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

export const ExpenseList = ({
	canManageLifecycle = false,
	data,
	onView,
	onEdit,
	onDelete,
	onRestore,
}: ExpenseListProps) => {
	const { data: items, total } = data;

	const renderCardFields = React.useCallback(
		(expense: ExpenseSummary): DetailFieldItem[] => [
			{ term: "Data", definition: formatter.date(expense.expenseDate) },
			{ term: "Valor", definition: formatter.currency(expense.amount) },
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
		[canManageLifecycle, onDelete, onEdit, onRestore, onView],
	);

	return (
		<DataCardList
			data={items}
			getRowKey={(expense) => expense.id}
			renderTitle={(expense) => expense.category}
			renderFields={renderCardFields}
			renderActions={renderCardActions}
			onCardAction={(expense) => onView?.(expense.id)}
			footerContent={<Pagination totalRecords={total} />}
		/>
	);
};
