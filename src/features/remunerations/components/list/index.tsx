import * as React from "react";
import { DataCardList } from "@/shared/components/data-card-list";
import { EntityActions } from "@/shared/components/entity-actions";
import type { DetailFieldItem } from "@/shared/components/entity-fields";
import { Pagination } from "@/shared/components/pagination";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import type { Remuneration } from "../../schemas/model";
import { getRemunerationLifecycleActions } from "../../utils/lifecycle-actions";

interface RemunerationListProps {
	emptyState?: React.ReactNode;
	canManageLifecycle?: boolean;
	data: QueryPaginatedReturnType<Remuneration>;
	onOpenPage?: (id: EntityId) => void;
	onView?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onDelete?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

export const RemunerationList = ({
	emptyState,
	canManageLifecycle = false,
	data,
	onOpenPage,
	onView,
	onEdit,
	onDelete,
	onRestore,
}: RemunerationListProps) => {
	const { data: items, total } = data;

	const renderCardFields = React.useCallback(
		(remuneration: Remuneration): DetailFieldItem[] => [
			{
				term: "Data de recebimento",
				definition: formatter.calendarDate(remuneration.paymentDate),
			},
			{
				term: "Valor",
				definition: (
					<SensitiveValue>
						{formatter.currency(remuneration.amount)}
					</SensitiveValue>
				),
			},
			{
				term: "Percentual efetivo (%)",
				definition: formatter.percent(remuneration.effectivePercentage),
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
					onOpenPage={
						onOpenPage ? () => onOpenPage(remuneration.id) : undefined
					}
					viewPermission={[
						"org:remunerations:read_all",
						"org:remunerations:read_own",
					]}
					editPermission="org:remunerations:update"
					restorePermission="org:remunerations:restore"
					deletePermission="org:remunerations:delete"
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
		[canManageLifecycle, onOpenPage, onDelete, onEdit, onRestore, onView],
	);

	return (
		<DataCardList
			emptyState={emptyState}
			data={items}
			getRowKey={(remuneration) => remuneration.id}
			renderTitle={(remuneration) =>
				`${remuneration.employeeName} • ${remuneration.contractProcessNumber}`
			}
			renderFields={renderCardFields}
			renderActions={renderCardActions}
			onCardAction={(remuneration) => (onOpenPage ?? onView)?.(remuneration.id)}
			footerContent={<Pagination totalRecords={total} />}
		/>
	);
};
