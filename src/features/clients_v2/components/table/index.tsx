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
import { Button, Dropdown, Label } from "@/shared/components/ui";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import { CLIENT_ALLOWED_SORT_COLUMNS } from "../../constants/sorting";
import type { Client } from "../../schemas/model";
import { formatClientDocument } from "../../utils/formatting";

export interface ClientTableProps {
	canManageLifecycle?: boolean;
	data: QueryPaginatedReturnType<Client>;
	onView?: (client: Client) => void;
	onEdit?: (client: Client) => void;
	onDelete?: (client: Client) => void;
	onRestore?: (client: Client) => void;
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
		const c = createColumnHelper<Client>();

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
						<Dropdown>
							<Button isIconOnly size="sm" variant="ghost" aria-label="Ações">
								<EllipsisVerticalIcon size={16} />
							</Button>
							<Dropdown.Popover placement="bottom end">
								<Dropdown.Menu>
									<Dropdown.Item
										textValue="Visualizar"
										onPress={() => onView?.(client)}
									>
										<EyeIcon size={16} />
										<Label>Visualizar</Label>
									</Dropdown.Item>
									{!client.isSoftDeleted && (
										<Dropdown.Item
											textValue="Editar"
											onPress={() => onEdit?.(client)}
										>
											<PenLineIcon size={16} />
											<Label>Editar</Label>
										</Dropdown.Item>
									)}
									{canManageLifecycle && client.isSoftDeleted && (
										<Dropdown.Item
											textValue="Restaurar"
											onPress={() => onRestore?.(client)}
										>
											<Undo2Icon size={16} />
											<Label>Restaurar</Label>
										</Dropdown.Item>
									)}
									{canManageLifecycle && !client.isSoftDeleted && (
										<Dropdown.Item
											textValue="Excluir"
											variant="danger"
											onPress={() => onDelete?.(client)}
										>
											<TrashIcon size={16} />
											<Label>Excluir</Label>
										</Dropdown.Item>
									)}
								</Dropdown.Menu>
							</Dropdown.Popover>
						</Dropdown>
					);
				},
			}),
		];
	}, [canManageLifecycle, onDelete, onEdit, onRestore, onView]);

	return (
		<DataTable
			columns={columns}
			data={data}
			footerContent={<Pagination totalRecords={total} size="sm" />}
		/>
	);
};
