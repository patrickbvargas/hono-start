import { createColumnHelper } from "@tanstack/react-table";
import * as React from "react";
import { DataTable } from "@/shared/components/data-table";
import { EntityActions } from "@/shared/components/entity-actions";
import { EntityStatus } from "@/shared/components/entity-status";
import { Pagination } from "@/shared/components/pagination";
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
						<EntityActions
							canEdit={canEditFee}
							canRestore={canManageLifecycle && fee.isSoftDeleted}
							canDelete={canManageLifecycle && !fee.isSoftDeleted}
							onView={() => onView?.(fee.id)}
							onEdit={() => onEdit?.(fee.id)}
							onRestore={() => onRestore?.(fee.id)}
							onDelete={() => onDelete?.(fee.id)}
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
