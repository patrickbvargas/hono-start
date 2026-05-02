import { createColumnHelper } from "@tanstack/react-table";
import * as React from "react";
import { DataTable } from "@/shared/components/data-table";
import { EntityActions } from "@/shared/components/entity-actions";
import { EntityIdTrigger } from "@/shared/components/entity-id-trigger";
import { EntityStatus } from "@/shared/components/entity-status";
import { Pagination } from "@/shared/components/pagination";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import { EMPLOYEE_ALLOWED_SORT_COLUMNS } from "../../constants/sorting";
import type { EmployeeSummary } from "../../schemas/model";

interface EmployeeTableProps {
	canManageLifecycle?: boolean;
	data: QueryPaginatedReturnType<EmployeeSummary>;
	onView?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onDelete?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

export const EmployeeTable = ({
	canManageLifecycle = false,
	data: { data, total },
	onView,
	onEdit,
	onDelete,
	onRestore,
}: EmployeeTableProps) => {
	const columns = React.useMemo(() => {
		const c = createColumnHelper<EmployeeSummary>();

		return [
			c.accessor("id", {
				header: "#",
				cell: ({ row }) => (
					<EntityIdTrigger id={row.original.id} onView={onView} />
				),
				enableSorting: false,
				meta: {
					headerClassName: "w-18",
					cellClassName: "whitespace-nowrap",
				},
			}),
			c.accessor("fullName", {
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
				header: "Remuneração",
				cell: ({ row }) => formatter.percent(row.original.remunerationPercent),
				enableSorting: EMPLOYEE_ALLOWED_SORT_COLUMNS.includes(
					"remunerationPercent",
				),
			}),
			c.accessor("contractCount", {
				header: "Contratos",
				enableSorting: EMPLOYEE_ALLOWED_SORT_COLUMNS.includes("contractCount"),
			}),
			c.accessor("role", {
				header: "Perfil",
				enableSorting: EMPLOYEE_ALLOWED_SORT_COLUMNS.includes("role"),
			}),
			c.accessor("isActive", {
				header: "Status",
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
				cell: ({ row }) => {
					const employee = row.original;

					return (
						<EntityActions
							canEdit={canManageLifecycle && !employee.isSoftDeleted}
							canRestore={canManageLifecycle && employee.isSoftDeleted}
							canDelete={canManageLifecycle && !employee.isSoftDeleted}
							onView={() => onView?.(employee.id)}
							onEdit={() => onEdit?.(employee.id)}
							onRestore={() => onRestore?.(employee.id)}
							onDelete={() => onDelete?.(employee.id)}
						/>
					);
				},
				meta: {
					cellClassName: "w-11",
				},
			}),
		];
	}, [canManageLifecycle, onView, onEdit, onDelete, onRestore]);

	return (
		<DataTable
			columns={columns}
			data={data}
			footerContent={<Pagination totalRecords={total} />}
		/>
	);
};
