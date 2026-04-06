import { createColumnHelper } from "@tanstack/react-table";
import { PencilIcon, RotateCcwIcon, Trash2Icon } from "lucide-react";
import * as React from "react";
import { DataTable } from "@/shared/components/data-table";
import { EntityStatus } from "@/shared/components/entity-status";
import { Pagination } from "@/shared/components/pagination";
import { Button } from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import { EMPLOYEE_ALLOWED_SORT_COLUMNS } from "../../constants";
import type { Employee } from "../../schemas/model";

export interface EmployeeTableProps {
	data: QueryPaginatedReturnType<Employee>;
	onEdit?: (employee: Employee) => void;
	onDelete?: (employee: Employee) => void;
	onRestore?: (employee: Employee) => void;
}

export const EmployeeTable = ({
	data: { data, total },
	onEdit,
	onDelete,
	onRestore,
}: EmployeeTableProps) => {
	const columns = React.useMemo(() => {
		const c = createColumnHelper<Employee>();

		return [
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
				header: "Cargo",
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
			c.accessor("status", {
				header: "Status",
				cell: ({ row }) => <EntityStatus status={row.original.status} />,
				enableSorting: EMPLOYEE_ALLOWED_SORT_COLUMNS.includes("status"),
			}),
			c.display({
				id: "actions",
				header: "Ações",
				cell: ({ row }) => {
					const employee = row.original;
					const isActive = employee.status === "Ativo";
					return (
						<div className="flex items-center gap-1">
							<Button
								size="sm"
								variant="ghost"
								onPress={() => onEdit?.(employee)}
								aria-label="Editar"
							>
								<PencilIcon size={14} />
							</Button>
							{isActive ? (
								<Button
									size="sm"
									variant="danger-soft"
									onPress={() => onDelete?.(employee)}
									aria-label="Excluir"
								>
									<Trash2Icon size={14} />
								</Button>
							) : (
								<Button
									size="sm"
									variant="ghost"
									onPress={() => onRestore?.(employee)}
									aria-label="Restaurar"
								>
									<RotateCcwIcon size={14} />
								</Button>
							)}
						</div>
					);
				},
			}),
		];
	}, [onEdit, onDelete, onRestore]);

	return (
		<DataTable
			columns={columns}
			data={data}
			footerContent={<Pagination totalRecords={total} size="sm" />}
		/>
	);
};
