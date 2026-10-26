import { createColumnHelper } from "@tanstack/react-table";
import * as React from "react";
import { RelatedRecordLink } from "@/features/related-records";
import { DataTable } from "@/shared/components/data-table";
import { EntityActions } from "@/shared/components/entity-actions";
import { EntityIdTrigger } from "@/shared/components/entity-id-trigger";
import { EntityStatus } from "@/shared/components/entity-status";
import { Pagination } from "@/shared/components/pagination";
import { formatter } from "@/shared/lib/formatter";
import type { dataTableFeatures } from "@/shared/lib/table";
import type { EntityId } from "@/shared/schemas/entity";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import { CONTRACT_ALLOWED_SORT_COLUMNS } from "../../constants/sorting";
import type { ContractSummary } from "../../schemas/model";
import { getContractLifecycleActions } from "../../utils/lifecycle-actions";

interface ContractTableProps {
	canManageLifecycle?: boolean;
	data: QueryPaginatedReturnType<ContractSummary>;
	onOpenPage?: (id: EntityId) => void;
	onView?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onDelete?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

export const ContractTable = ({
	canManageLifecycle = false,
	data: { data, total },
	onOpenPage,
	onView,
	onEdit,
	onDelete,
	onRestore,
}: ContractTableProps) => {
	const session = useLoggedUserSession();
	const columns = React.useMemo(() => {
		const c = createColumnHelper<typeof dataTableFeatures, ContractSummary>();

		return [
			c.accessor("id", {
				header: "#",
				cell: ({ row }) => (
					<EntityIdTrigger
						id={row.original.id}
						onOpenPage={onOpenPage}
						onView={onView}
						actionLabel={`Abrir página do contrato #${row.original.id}`}
					/>
				),
				enableSorting: CONTRACT_ALLOWED_SORT_COLUMNS.includes("id"),
				meta: {
					headerClassName: "w-18",
					cellClassName: "whitespace-nowrap",
				},
			}),
			c.accessor("processNumber", {
				cell: (context) => (
					<EntityIdTrigger
						id={context.row.original.id}
						onOpenPage={onOpenPage}
						label={context.getValue()}
					/>
				),
				header: "Processo",
				enableSorting: CONTRACT_ALLOWED_SORT_COLUMNS.includes("processNumber"),
				meta: {
					minColumnWidth: 200,
				},
			}),
			c.accessor("client", {
				cell: ({ row }) =>
					hasPermission(session, "org:clients:read") ? (
						<RelatedRecordLink
							variant="table"
							kind="client"
							id={row.original.clientId}
						>
							{row.original.client}
						</RelatedRecordLink>
					) : (
						row.original.client
					),
				header: "Cliente",
				enableSorting: CONTRACT_ALLOWED_SORT_COLUMNS.includes("client"),
				meta: {
					minColumnWidth: 240,
				},
			}),
			c.accessor("lawyer", {
				header: "Advogado",
				meta: {
					minColumnWidth: 240,
				},
			}),
			c.accessor("legalArea", {
				header: "Área",
				enableSorting: CONTRACT_ALLOWED_SORT_COLUMNS.includes("legalArea"),
			}),
			c.accessor("status", {
				header: "Andamento",
				enableSorting: CONTRACT_ALLOWED_SORT_COLUMNS.includes("status"),
			}),
			c.accessor("feePercentage", {
				header: "% Honorários",
				cell: ({ row }) => formatter.percent(row.original.feePercentage),
				enableSorting: CONTRACT_ALLOWED_SORT_COLUMNS.includes("feePercentage"),
			}),
			c.accessor("isActive", {
				header: "Cadastro",
				cell: ({ row }) => (
					<EntityStatus
						isActive={row.original.isActive}
						isSoftDeleted={row.original.isSoftDeleted}
					/>
				),
				enableSorting: CONTRACT_ALLOWED_SORT_COLUMNS.includes("isActive"),
			}),
			c.accessor("createdAt", {
				header: "Criado em",
				cell: ({ row }) => formatter.date(row.original.createdAt),
				enableSorting: CONTRACT_ALLOWED_SORT_COLUMNS.includes("createdAt"),
			}),
			c.display({
				id: "actions",
				cell: ({ row }) => {
					const contract = row.original;
					const actions = getContractLifecycleActions({
						canManageLifecycle,
						isSoftDeleted: contract.isSoftDeleted,
						statusValue: contract.statusValue,
					});

					return (
						<EntityActions
							onOpenPage={
								onOpenPage ? () => onOpenPage(contract.id) : undefined
							}
							viewPermission={[
								"org:contracts:read_all",
								"org:contracts:read_assigned",
							]}
							editPermission={[
								"org:contracts:update_all",
								"org:contracts:update_assigned",
							]}
							restorePermission="org:contracts:restore"
							deletePermission="org:contracts:delete"
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
				meta: {
					cellClassName: "w-11",
				},
			}),
		];
	}, [
		session,
		canManageLifecycle,
		onDelete,
		onEdit,
		onRestore,
		onView,
		onOpenPage,
	]);

	return (
		<DataTable
			columns={columns}
			data={data}
			footerContent={<Pagination totalRecords={total} />}
		/>
	);
};
