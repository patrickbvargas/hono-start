import * as React from "react";
import { DataCardList } from "@/shared/components/data-card-list";
import { EntityActions } from "@/shared/components/entity-actions";
import type { DetailFieldItem } from "@/shared/components/entity-fields";
import { EntityStatus } from "@/shared/components/entity-status";
import { Pagination } from "@/shared/components/pagination";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import type { FeeSummary } from "../../schemas/model";
import { getFeeLifecycleActions } from "../../utils/lifecycle-actions";

interface FeeListProps {
	canManageLifecycle?: boolean;
	data: QueryPaginatedReturnType<FeeSummary>;
	onView?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onDelete?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

export const FeeList = ({
	canManageLifecycle = false,
	data,
	onView,
	onEdit,
	onDelete,
	onRestore,
}: FeeListProps) => {
	const { data: items, total } = data;

	const renderCardFields = React.useCallback(
		(fee: FeeSummary): DetailFieldItem[] => [
			{
				term: "Processo",
				definition: fee.contractProcessNumber,
			},
			{
				term: "Receita",
				definition: fee.revenueType,
			},
			{
				term: "Competência",
				definition: formatter.date(fee.paymentDate),
			},
			{
				term: "Valor",
				definition: formatter.currency(fee.amount),
			},
			{
				term: "Nº da parcela",
				definition: fee.installmentNumber,
			},
			{
				term: "Situação",
				definition: (
					<EntityStatus
						isActive={fee.isActive}
						isSoftDeleted={fee.isSoftDeleted}
					/>
				),
			},
			{
				term: "Registro em",
				definition: formatter.date(fee.createdAt),
			},
		],
		[],
	);

	const renderCardActions = React.useCallback(
		(fee: FeeSummary) => {
			const actions = getFeeLifecycleActions({
				canManageLifecycle,
				contractStatusValue: fee.contractStatusValue,
				isSoftDeleted: fee.isSoftDeleted,
			});

			return (
				<EntityActions
					canEdit={actions.canEdit}
					canRestore={actions.canRestore}
					canDelete={actions.canDelete}
					onView={() => onView?.(fee.id)}
					onEdit={() => onEdit?.(fee.id)}
					onRestore={() => onRestore?.(fee.id)}
					onDelete={() => onDelete?.(fee.id)}
				/>
			);
		},
		[canManageLifecycle, onDelete, onEdit, onRestore, onView],
	);

	return (
		<DataCardList
			data={items}
			getRowKey={(fee) => fee.id}
			renderTitle={(fee) => `${fee.contractProcessNumber} • ${fee.revenueType}`}
			renderFields={renderCardFields}
			renderActions={renderCardActions}
			onCardAction={(fee) => onView?.(fee.id)}
			footerContent={<Pagination totalRecords={total} />}
		/>
	);
};
