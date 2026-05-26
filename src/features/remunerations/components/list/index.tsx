import * as React from "react";
import { DataCardList } from "@/shared/components/data-card-list";
import { EntityActions } from "@/shared/components/entity-actions";
import type { DetailFieldItem } from "@/shared/components/entity-fields";
import { EntityStatus } from "@/shared/components/entity-status";
import { Pagination } from "@/shared/components/pagination";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import type { Remuneration } from "../../schemas/model";
import { getRemunerationLifecycleActions } from "../../utils/lifecycle-actions";

interface RemunerationListProps {
	canManageLifecycle?: boolean;
	data: QueryPaginatedReturnType<Remuneration>;
	onView?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onDelete?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

export const RemunerationList = ({
	canManageLifecycle = false,
	data,
	onView,
	onEdit,
	onDelete,
	onRestore,
}: RemunerationListProps) => {
	const { data: items, total } = data;

	const renderCardFields = React.useCallback(
		(remuneration: Remuneration): DetailFieldItem[] => [
			{
				term: "Competência",
				definition: formatter.date(remuneration.paymentDate),
			},
			{
				term: "Valor",
				definition: formatter.currency(remuneration.amount),
			},
			{
				term: "% Efetivo",
				definition: formatter.percent(remuneration.effectivePercentage),
			},
			{
				term: "Situação",
				definition: (
					<EntityStatus
						isActive={remuneration.isActive}
						isSoftDeleted={remuneration.isSoftDeleted}
					/>
				),
			},
		],
		[],
	);

	const renderCardActions = React.useCallback(
		(remuneration: Remuneration) => {
			const actions = getRemunerationLifecycleActions({
				canManageLifecycle,
				isSoftDeleted: remuneration.isSoftDeleted,
			});

			return (
				<EntityActions
					canEdit={actions.canEdit}
					canRestore={actions.canRestore}
					canDelete={actions.canDelete}
					onView={() => onView?.(remuneration.id)}
					onEdit={() => onEdit?.(remuneration.id)}
					onRestore={() => onRestore?.(remuneration.id)}
					onDelete={() => onDelete?.(remuneration.id)}
				/>
			);
		},
		[canManageLifecycle, onDelete, onEdit, onRestore, onView],
	);

	return (
		<DataCardList
			data={items}
			getRowKey={(remuneration) => remuneration.id}
			renderTitle={(remuneration) =>
				`${remuneration.employeeName} • ${remuneration.contractProcessNumber}`
			}
			renderFields={renderCardFields}
			renderActions={renderCardActions}
			onCardAction={(remuneration) => onView?.(remuneration.id)}
			footerContent={<Pagination totalRecords={total} />}
		/>
	);
};
