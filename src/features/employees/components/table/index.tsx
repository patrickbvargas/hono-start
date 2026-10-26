import { createColumnHelper } from "@tanstack/react-table";
import * as React from "react";
import { DataTable } from "@/shared/components/data-table";
import { EntityActions } from "@/shared/components/entity-actions";
import { EntityIdTrigger } from "@/shared/components/entity-id-trigger";
import { EntityStatus } from "@/shared/components/entity-status";
import { Pagination } from "@/shared/components/pagination";
import { formatter } from "@/shared/lib/formatter";
import type { dataTableFeatures } from "@/shared/lib/table";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import { EMPLOYEE_ALLOWED_SORT_COLUMNS } from "../../constants/sorting";
import type { EmployeeSummary } from "../../schemas/model";
import { getEmployeeLifecycleActions } from "../../utils/lifecycle-actions";

interface EmployeeTableProps {
	canManageLifecycle?: boolean;
	data: QueryPaginatedReturnType<EmployeeSummary>;
	onOpenPage?: (id: EntityId) => void;
	onView?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onDelete?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

export const EmployeeTable = ({
	canManageLifecycle = false,
	data: { data, total },
	onOpenPage,
	onView,
	onEdit,
	onDelete,
	onRestore,
}: EmployeeTableProps) => {
	const renderActions = React.useCallback(
		(
			employee: EmployeeSummary,
			presentation: "dropdown" | "context" = "dropdown",
		) => {
			const actions = getEmployeeLifecycleActions({
				canManageLifecycle,
				isSoftDeleted: employee.isSoftDeleted,
			});

			return (
				<EntityActions
					presentation={presentation}
					onOpenPage={onOpenPage ? () => onOpenPage(employee.id) : undefined}
					viewPermission="org:employees:read"
					editPermission="org:employees:update"
					restorePermission="org:employees:restore"
					deletePermission="org:employees:delete"
					canEdit={actions.canEdit}
					canRestore={actions.canRestore}
					canDelete={actions.canDelete}
					onView={onView ? () => onView(employee.id) : undefined}
					onEdit={onEdit ? () => onEdit(employee.id) : undefined}
					onRestore={onRestore ? () => onRestore(employee.id) : undefined}
					onDelete={onDelete ? () => onDelete(employee.id) : undefined}
				/>
			);
		},
		[canManageLifecycle, onOpenPage, onView, onEdit, onDelete, onRestore],
	);

	const columns = React.useMemo(() => {
		const c = createColumnHelper<typeof dataTableFeatures, EmployeeSummary>();

		return [
			c.accessor("id", {
				header: "#",
				cell: ({ row }) => <EntityIdTrigger id={row.original.id} />,
				enableSorting: EMPLOYEE_ALLOWED_SORT_COLUMNS.includes("id"),
				meta: {
					headerClassName: "w-18",
					cellClassName: "whitespace-nowrap",
				},
			}),
			c.accessor("fullName", {
				cell: (context) => (
					<EntityIdTrigger
						id={context.row.original.id}
						label={context.getValue()}
					/>
				),
				header: "Nome",
				enableSorting: EMPLOYEE_ALLOWED_SORT_COLUMNS.includes("fullName"),
				meta: {
					minColumnWidth: 300,
				},
			}),
			c.accessor("oabNumber", {
				header: "OAB",
				cell: ({ row }) => formatter.oab(row.original.oabNumber),
				enableSorting: EMPLOYEE_ALLOWED_SORT_COLUMNS.includes("oabNumber"),
			}),
			c.accessor("type", {
				header: "Função",
				enableSorting: EMPLOYEE_ALLOWED_SORT_COLUMNS.includes("type"),
			}),
			c.accessor("remunerationPercent", {
				header: "% Remuneração",
				cell: ({ row }) => formatter.percent(row.original.remunerationPercent),
				enableSorting: EMPLOYEE_ALLOWED_SORT_COLUMNS.includes(
					"remunerationPercent",
				),
			}),
			c.accessor("contractCount", {
				header: "Contratos",
				enableSorting: EMPLOYEE_ALLOWED_SORT_COLUMNS.includes("contractCount"),
			}),
			c.accessor("isActive", {
				header: "Situação",
				cell: ({ row }) => (
					<EntityStatus
						isActive={row.original.isActive}
						isSoftDeleted={row.original.isSoftDeleted}
					/>
				),
				enableSorting: EMPLOYEE_ALLOWED_SORT_COLUMNS.includes("isActive"),
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
