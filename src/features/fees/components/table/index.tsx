import { createColumnHelper } from "@tanstack/react-table";
import * as React from "react";
import { DataTable } from "@/shared/components/data-table";
import { EntityActions } from "@/shared/components/entity-actions";
import { EntityIdTrigger } from "@/shared/components/entity-id-trigger";
import { EntityStatus } from "@/shared/components/entity-status";
import { Pagination } from "@/shared/components/pagination";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import type { dataTableFeatures } from "@/shared/lib/table";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import { FEE_ALLOWED_SORT_COLUMNS } from "../../constants/sorting";
import type { FeeSummary } from "../../schemas/model";
import { getFeeLifecycleActions } from "../../utils/lifecycle-actions";

interface FeeTableProps {
	canManageLifecycle?: boolean;
	data: QueryPaginatedReturnType<FeeSummary>;
	onOpenPage?: (id: EntityId) => void;
	onView?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onDelete?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

export const FeeTable = ({
	canManageLifecycle = false,
	data: { data, total },
	onOpenPage,
	onView,
	onEdit,
	onDelete,
	onRestore,
}: FeeTableProps) => {
	const renderActions = React.useCallback(
		(fee: FeeSummary, presentation: "dropdown" | "context" = "dropdown") => {
			const actions = getFeeLifecycleActions({
				canManageLifecycle,
				contractStatusValue: fee.contractStatusValue,
				isSoftDeleted: fee.isSoftDeleted,
			});

			return (
				<EntityActions
					presentation={presentation}
					onOpenPage={onOpenPage ? () => onOpenPage(fee.id) : undefined}
					viewPermission={["org:fees:read_all", "org:fees:read_assigned"]}
					editPermission="org:fees:update"
					restorePermission="org:fees:restore"
					deletePermission="org:fees:delete"
					canEdit={actions.canEdit}
					canRestore={actions.canRestore}
					canDelete={actions.canDelete}
					onView={onView ? () => onView(fee.id) : undefined}
					onEdit={onEdit ? () => onEdit(fee.id) : undefined}
					onRestore={onRestore ? () => onRestore(fee.id) : undefined}
					onDelete={onDelete ? () => onDelete(fee.id) : undefined}
				/>
			);
		},
		[canManageLifecycle, onOpenPage, onDelete, onEdit, onRestore, onView],
	);

	const columns = React.useMemo(() => {
		const c = createColumnHelper<typeof dataTableFeatures, FeeSummary>();

		return [
			c.accessor("id", {
				header: "#",
				cell: ({ row }) => <EntityIdTrigger id={row.original.id} />,
				enableSorting: FEE_ALLOWED_SORT_COLUMNS.includes("id"),
				meta: {
					headerClassName: "w-18",
					cellClassName: "whitespace-nowrap",
				},
			}),
			c.accessor("contractProcessNumber", {
				cell: (context) => (
					<EntityIdTrigger
						id={context.row.original.id}
						label={context.getValue()}
					/>
				),
				header: "Processo",
				meta: { minColumnWidth: 180 },
			}),
			c.accessor("revenueType", {
				header: "Tipo de honorário",
				meta: { minColumnWidth: 160 },
			}),
			c.accessor("paymentDate", {
				header: "Data de recebimento",
				cell: ({ row }) => formatter.calendarDate(row.original.paymentDate),
				enableSorting: FEE_ALLOWED_SORT_COLUMNS.includes("paymentDate"),
			}),
			c.accessor("amount", {
				header: "Valor",
				cell: ({ row }) => (
					<SensitiveValue>
						{formatter.currency(row.original.amount)}
					</SensitiveValue>
				),
				enableSorting: FEE_ALLOWED_SORT_COLUMNS.includes("amount"),
				meta: {
					cellClassName: "text-right",
				},
			}),
			c.accessor("installmentNumber", {
				header: "Nº da parcela",
				enableSorting: FEE_ALLOWED_SORT_COLUMNS.includes("installmentNumber"),
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
			c.display({
				id: "actions",
				cell: ({ row }) => renderActions(row.original),
				meta: {
					cellClassName: "w-11",
				},
			}),
		];
	}, [renderActions]);

	return (
		<DataTable
			columns={columns}
			data={data}
			renderRowContextMenu={(index) => renderActions(data[index], "context")}
			onRowAction={
				onOpenPage ? (index) => onOpenPage(data[index].id) : undefined
			}
			footerContent={<Pagination totalRecords={total} />}
		/>
	);
};
