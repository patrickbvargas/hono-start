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
						<Dropdown>
							<Button isIconOnly size="sm" variant="ghost" aria-label="Ações">
								<EllipsisVerticalIcon size={16} />
							</Button>
							<Dropdown.Popover placement="bottom end">
								<Dropdown.Menu>
									<Dropdown.Item
										textValue="Visualizar"
										onPress={() => onView?.(fee.id)}
									>
										<EyeIcon size={16} />
										<Label>Visualizar</Label>
									</Dropdown.Item>
									{canEditFee ? (
										<Dropdown.Item
											textValue="Editar"
											onPress={() => onEdit?.(fee.id)}
										>
											<PenLineIcon size={16} />
											<Label>Editar</Label>
										</Dropdown.Item>
									) : null}
									{canManageLifecycle && fee.isSoftDeleted ? (
										<Dropdown.Item
											textValue="Restaurar"
											onPress={() => onRestore?.(fee.id)}
										>
											<Undo2Icon size={16} />
											<Label>Restaurar</Label>
										</Dropdown.Item>
									) : null}
									{canManageLifecycle && !fee.isSoftDeleted ? (
										<Dropdown.Item
											textValue="Excluir"
											variant="danger"
											onPress={() => onDelete?.(fee.id)}
										>
											<TrashIcon size={16} />
											<Label>Excluir</Label>
										</Dropdown.Item>
									) : null}
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
