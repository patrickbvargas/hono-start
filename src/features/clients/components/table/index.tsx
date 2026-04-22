import { createColumnHelper } from "@tanstack/react-table";
import * as React from "react";
import { DataTable } from "@/shared/components/data-table";
import { EntityActions } from "@/shared/components/entity-actions";
import { EntityStatus } from "@/shared/components/entity-status";
import { Pagination } from "@/shared/components/pagination";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import { CLIENT_ALLOWED_SORT_COLUMNS } from "../../constants/sorting";
import type { ClientSummary } from "../../schemas/model";
import { formatClientDocument } from "../../utils/format";

interface ClientTableProps {
	canManageLifecycle?: boolean;
	data: QueryPaginatedReturnType<ClientSummary>;
	onView?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onDelete?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

export const ClientTable = ({
	canManageLifecycle = false,
	data: { data, total },
	onView,
	onEdit,
	onDelete,
	onRestore,
}: ClientTableProps) => {
	const columns = React.useMemo(() => {
		const c = createColumnHelper<ClientSummary>();

		return [
			c.accessor("fullName", {
				header: "Nome",
				enableSorting: CLIENT_ALLOWED_SORT_COLUMNS.includes("fullName"),
				meta: {
					minColumnWidth: 280,
				},
			}),
			c.accessor("document", {
				header: "Documento",
				cell: ({ row }) => formatClientDocument(row.original.document),
				enableSorting: CLIENT_ALLOWED_SORT_COLUMNS.includes("document"),
			}),
			c.accessor("type", {
				header: "Tipo",
				enableSorting: CLIENT_ALLOWED_SORT_COLUMNS.includes("type"),
			}),
			c.accessor("contractCount", {
				header: "Contratos",
				enableSorting: false,
			}),
			c.accessor("isActive", {
				header: "Status",
				cell: ({ row }) => (
					<EntityStatus
						isActive={row.original.isActive}
						isSoftDeleted={row.original.isSoftDeleted}
					/>
				),
				enableSorting: CLIENT_ALLOWED_SORT_COLUMNS.includes("isActive"),
			}),
			c.display({
				id: "actions",
				header: "Ações",
				cell: ({ row }) => {
					const client = row.original;

					return (
						<EntityActions
							canEdit={!client.isSoftDeleted}
							canRestore={canManageLifecycle && client.isSoftDeleted}
							canDelete={canManageLifecycle && !client.isSoftDeleted}
							onView={() => onView?.(client.id)}
							onEdit={() => onEdit?.(client.id)}
							onRestore={() => onRestore?.(client.id)}
							onDelete={() => onDelete?.(client.id)}
						/>
					);
				},
			}),
		];
	}, [canManageLifecycle, onDelete, onEdit, onRestore, onView]);

	return (
		<DataTable
			columns={columns}
			data={data}
			footerContent={<Pagination totalRecords={total} />}
		/>
	);
};
