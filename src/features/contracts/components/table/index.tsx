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
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import { CONTRACT_ALLOWED_SORT_COLUMNS } from "../../constants/sorting";
import {
	CONTRACT_STATUS_CANCELLED_VALUE,
	CONTRACT_STATUS_COMPLETED_VALUE,
} from "../../constants/values";
import type { ContractSummary } from "../../schemas/model";

interface ContractTableProps {
	canManageLifecycle?: boolean;
	data: QueryPaginatedReturnType<ContractSummary>;
	onView?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onDelete?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

export const ContractTable = ({
	canManageLifecycle = false,
	data: { data, total },
	onView,
	onEdit,
	onDelete,
	onRestore,
}: ContractTableProps) => {
	const columns = React.useMemo(() => {
		const c = createColumnHelper<ContractSummary>();

		return [
			c.accessor("processNumber", {
				header: "Processo",
				enableSorting: CONTRACT_ALLOWED_SORT_COLUMNS.includes("processNumber"),
				meta: {
					minColumnWidth: 200,
				},
			}),
			c.accessor("client", {
				header: "Cliente",
				enableSorting: CONTRACT_ALLOWED_SORT_COLUMNS.includes("client"),
				meta: {
					minColumnWidth: 240,
				},
			}),
			c.accessor("legalArea", {
				header: "Área jurídica",
				enableSorting: CONTRACT_ALLOWED_SORT_COLUMNS.includes("legalArea"),
			}),
			c.accessor("status", {
				header: "Status",
				enableSorting: CONTRACT_ALLOWED_SORT_COLUMNS.includes("status"),
			}),
			c.accessor("feePercentage", {
				header: "Percentual",
				cell: ({ row }) => formatter.percent(row.original.feePercentage),
				enableSorting: CONTRACT_ALLOWED_SORT_COLUMNS.includes("feePercentage"),
			}),
			c.accessor("isActive", {
				header: "Situação",
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
				header: "Ações",
				cell: ({ row }) => {
					const contract = row.original;
					const canEditContract =
						!contract.isSoftDeleted &&
						!(
							[
								CONTRACT_STATUS_CANCELLED_VALUE,
								CONTRACT_STATUS_COMPLETED_VALUE,
							] as string[]
						).includes(contract.statusValue);

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
								<DropdownMenuItem onClick={() => onView?.(contract.id)}>
									<EyeIcon size={16} />
									Visualizar
								</DropdownMenuItem>
								{canEditContract && (
									<DropdownMenuItem onClick={() => onEdit?.(contract.id)}>
										<PenLineIcon size={16} />
										Editar
									</DropdownMenuItem>
								)}
								{canManageLifecycle && contract.isSoftDeleted && (
									<DropdownMenuItem onClick={() => onRestore?.(contract.id)}>
										<Undo2Icon size={16} />
										Restaurar
									</DropdownMenuItem>
								)}
								{canManageLifecycle && !contract.isSoftDeleted && (
									<DropdownMenuItem
										variant="destructive"
										onClick={() => onDelete?.(contract.id)}
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
