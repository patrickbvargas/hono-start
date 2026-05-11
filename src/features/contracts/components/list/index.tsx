import * as React from "react";
import { DataCardList } from "@/shared/components/data-card-list";
import { EntityActions } from "@/shared/components/entity-actions";
import type { DetailFieldItem } from "@/shared/components/entity-fields";
import { EntityStatus } from "@/shared/components/entity-status";
import { Pagination } from "@/shared/components/pagination";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import type { ContractSummary } from "../../schemas/model";
import { getContractLifecycleActions } from "../../utils/lifecycle-actions";

interface ContractListProps {
	canManageLifecycle?: boolean;
	data: QueryPaginatedReturnType<ContractSummary>;
	onView?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onDelete?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

export const ContractList = ({
	canManageLifecycle = false,
	data,
	onView,
	onEdit,
	onDelete,
	onRestore,
}: ContractListProps) => {
	const { data: items, total } = data;

	const renderCardFields = React.useCallback(
		(contract: ContractSummary): DetailFieldItem[] => [
			{
				term: "Cliente",
				definition: contract.client,
			},
			{
				term: "Área",
				definition: contract.legalArea,
			},
			{
				term: "Status",
				definition: contract.status,
			},
			{
				term: "Percentual",
				definition: formatter.percent(contract.feePercentage),
			},
			{
				term: "Situação",
				definition: (
					<EntityStatus
						isActive={contract.isActive}
						isSoftDeleted={contract.isSoftDeleted}
					/>
				),
			},
			{
				term: "Criado em",
				definition: formatter.date(contract.createdAt),
			},
		],
		[],
	);

	const renderCardActions = React.useCallback(
		(contract: ContractSummary) => {
			const actions = getContractLifecycleActions({
				canManageLifecycle,
				isSoftDeleted: contract.isSoftDeleted,
				statusValue: contract.statusValue,
			});

			return (
				<EntityActions
					canEdit={actions.canEdit}
					canRestore={actions.canRestore}
					canDelete={actions.canDelete}
					onView={() => onView?.(contract.id)}
					onEdit={() => onEdit?.(contract.id)}
					onRestore={() => onRestore?.(contract.id)}
					onDelete={() => onDelete?.(contract.id)}
				/>
			);
		},
		[canManageLifecycle, onDelete, onEdit, onRestore, onView],
	);

	return (
		<DataCardList
			data={items}
			getRowKey={(contract) => contract.id}
			renderTitle={(contract) => contract.processNumber}
			renderFields={renderCardFields}
			renderActions={renderCardActions}
			onCardAction={(contract) => onView?.(contract.id)}
			footerContent={<Pagination totalRecords={total} />}
		/>
	);
};
