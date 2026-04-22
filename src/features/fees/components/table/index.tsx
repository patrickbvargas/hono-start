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
import {
	CONTRACT_STATUS_CANCELLED_VALUE,
	CONTRACT_STATUS_COMPLETED_VALUE,
} from "@/shared/session";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import { FEE_ALLOWED_SORT_COLUMNS } from "../../constants/sorting";
import type { FeeSummary } from "../../schemas/model";

interface FeeTableProps {
	canManageLifecycle?: boolean;
	data: QueryPaginatedReturnType<FeeSummary>;
	onView?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onDelete?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

export const FeeTable = ({
	canManageLifecycle = false,
	data: { data, total },
	onView,
	onEdit,
	onDelete,
	onRestore,
}: FeeTableProps) => {
	const columns = React.useMemo(() => {
		const c = createColumnHelper<FeeSummary>();

		return [
			c.accessor("contractProcessNumber", {
				header: "Contrato",
				meta: { minColumnWidth: 180 },
			}),
			c.accessor("revenueType", {
				header: "Receita",
				meta: { minColumnWidth: 160 },
			}),
			c.accessor("paymentDate", {
				header: "Pagamento",
				cell: ({ row }) => formatter.date(row.original.paymentDate),
				enableSorting: FEE_ALLOWED_SORT_COLUMNS.includes("paymentDate"),
			}),
			c.accessor("amount", {
				header: "Valor",
				cell: ({ row }) => formatter.currency(row.original.amount),
				enableSorting: FEE_ALLOWED_SORT_COLUMNS.includes("amount"),
			}),
			c.accessor("installmentNumber", {
				header: "Parcela",
				enableSorting: FEE_ALLOWED_SORT_COLUMNS.includes("installmentNumber"),
			}),
			c.accessor("generatesRemuneration", {
				header: "Gera remuneração",
				cell: ({ row }) => (row.original.generatesRemuneration ? "Sim" : "Não"),
			}),
			c.accessor("isActive", {
				header: "Situação",
				cell: ({ row }) => (
					<EntityStatus
						isActive={row.original.isActive}
						isSoftDeleted={row.original.isSoftDeleted}
					/>
				),
			}),
			c.accessor("createdAt", {
				header: "Criado em",
				cell: ({ row }) => formatter.date(row.original.createdAt),
				enableSorting: FEE_ALLOWED_SORT_COLUMNS.includes("createdAt"),
			}),
			c.display({
				id: "actions",
				header: "Ações",
				cell: ({ row }) => {
					const fee = row.original;
					const canEditFee =
						!fee.isSoftDeleted &&
						!(
							[
								CONTRACT_STATUS_CANCELLED_VALUE,
								CONTRACT_STATUS_COMPLETED_VALUE,
							] as string[]
						).includes(fee.contractStatusValue);

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
								<DropdownMenuItem onClick={() => onView?.(fee.id)}>
									<EyeIcon size={16} />
									Visualizar
								</DropdownMenuItem>
								{canEditFee ? (
									<DropdownMenuItem onClick={() => onEdit?.(fee.id)}>
										<PenLineIcon size={16} />
										Editar
									</DropdownMenuItem>
								) : null}
								{canManageLifecycle && fee.isSoftDeleted ? (
									<DropdownMenuItem onClick={() => onRestore?.(fee.id)}>
										<Undo2Icon size={16} />
										Restaurar
									</DropdownMenuItem>
								) : null}
								{canManageLifecycle && !fee.isSoftDeleted ? (
									<DropdownMenuItem
										variant="destructive"
										onClick={() => onDelete?.(fee.id)}
									>
										<TrashIcon size={16} />
										Excluir
									</DropdownMenuItem>
								) : null}
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
