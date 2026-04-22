import { createColumnHelper } from "@tanstack/react-table";
import {
	EllipsisVerticalIcon,
	EyeIcon,
	PenLineIcon,
	TrashIcon,
	Undo2Icon,
} from "lucide-react";
import * as React from "react";
import { DataTable } from "@/shared/components/data-table";
import { EntityStatus } from "@/shared/components/entity-status";
import { Pagination } from "@/shared/components/pagination";
import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/components/ui";
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
						<DropdownMenu>
							<DropdownMenuTrigger
								render={
									<Button size="icon-sm" variant="ghost" aria-label="Ações" />
								}
							>
								<EllipsisVerticalIcon size={16} />
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => onView?.(client.id)}>
									<EyeIcon size={16} />
									Visualizar
								</DropdownMenuItem>
								{!client.isSoftDeleted && (
									<DropdownMenuItem onClick={() => onEdit?.(client.id)}>
										<PenLineIcon size={16} />
										Editar
									</DropdownMenuItem>
								)}
								{canManageLifecycle && client.isSoftDeleted && (
									<DropdownMenuItem onClick={() => onRestore?.(client.id)}>
										<Undo2Icon size={16} />
										Restaurar
									</DropdownMenuItem>
								)}
								{canManageLifecycle && !client.isSoftDeleted && (
									<DropdownMenuItem
										variant="destructive"
										onClick={() => onDelete?.(client.id)}
									>
										<TrashIcon size={16} />
										Excluir
									</DropdownMenuItem>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
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
