import * as React from "react";
import { DataCardList } from "@/shared/components/data-card-list";
import { EntityActions } from "@/shared/components/entity-actions";
import type { DetailFieldItem } from "@/shared/components/entity-fields";
import { EntityStatus } from "@/shared/components/entity-status";
import { Pagination } from "@/shared/components/pagination";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import type { EmployeeSummary } from "../../schemas/model";
import { getEmployeeLifecycleActions } from "../../utils/lifecycle-actions";

interface EmployeeListProps {
	canManageLifecycle?: boolean;
	data: QueryPaginatedReturnType<EmployeeSummary>;
	onView?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onDelete?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

export const EmployeeList = ({
	canManageLifecycle = false,
	data,
	onView,
	onEdit,
	onDelete,
	onRestore,
}: EmployeeListProps) => {
	const { data: items, total } = data;

	const renderCardFields = React.useCallback(
		(employee: EmployeeSummary): DetailFieldItem[] => [
			{
				term: "OAB",
				definition: formatter.oab(employee.oabNumber),
			},
			{
				term: "Função",
				definition: employee.type,
			},
			{
				term: "Remuneração",
				definition: formatter.percent(employee.remunerationPercent),
			},
			{
				term: "Contratos",
				definition: employee.contractCount,
			},
			{
				term: "Perfil",
				definition: employee.role,
			},
			{
				term: "Status",
				definition: (
					<EntityStatus
						isActive={employee.isActive}
						isSoftDeleted={employee.isSoftDeleted}
					/>
				),
			},
		],
		[],
	);

	const renderCardActions = React.useCallback(
		(employee: EmployeeSummary) => {
			const actions = getEmployeeLifecycleActions({
				canManageLifecycle,
				isSoftDeleted: employee.isSoftDeleted,
			});

			return (
				<EntityActions
					canEdit={actions.canEdit}
					canRestore={actions.canRestore}
					canDelete={actions.canDelete}
					onView={() => onView?.(employee.id)}
					onEdit={() => onEdit?.(employee.id)}
					onRestore={() => onRestore?.(employee.id)}
					onDelete={() => onDelete?.(employee.id)}
				/>
			);
		},
		[canManageLifecycle, onDelete, onEdit, onRestore, onView],
	);

	return (
		<DataCardList
			data={items}
			getRowKey={(employee) => employee.id}
			renderTitle={(employee) => employee.fullName}
			renderFields={renderCardFields}
			renderActions={renderCardActions}
			onCardAction={(employee) => onView?.(employee.id)}
			footerContent={<Pagination totalRecords={total} />}
		/>
	);
};
