import { createColumnHelper } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { EntityIdTrigger } from "@/shared/components/entity-id-trigger";
import { EntityStatus } from "@/shared/components/entity-status";
import { formatter } from "@/shared/lib/formatter";
import type { dataTableFeatures } from "@/shared/lib/table";
import { EMPLOYEE_ALLOWED_SORT_COLUMNS } from "../../constants/sorting";
import type { EmployeeSummary } from "../../schemas/model";

export function getEmployeeTableColumns(
	renderActions: (row: EmployeeSummary) => ReactNode,
) {
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
			header: "Remuneração (%)",
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
}
