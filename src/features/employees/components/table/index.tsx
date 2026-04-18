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
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import { EMPLOYEE_ALLOWED_SORT_COLUMNS } from "../../constants/sorting";
import type { EmployeeSummary } from "../../schemas/model";

export interface EmployeeTableProps {
	canManage?: boolean;
	data: QueryPaginatedReturnType<EmployeeSummary>;
	onView?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onDelete?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

export const EmployeeTable = ({
	canManage = false,
	data: { data, total },
	onView,
	onEdit,
	onDelete,
	onRestore,
}: EmployeeTableProps) => {
	const columns = React.useMemo(() => {
		const c = createColumnHelper<EmployeeSummary>();

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
				header: "Ações",
				cell: ({ row }) => {
					const employee = row.original;

					return (
						<Dropdown>
							<Button isIconOnly size="sm" variant="ghost" aria-label="Actions">
								<EllipsisVerticalIcon size={16} />
							</Button>
							<Dropdown.Popover placement="bottom end">
								<Dropdown.Menu>
									<Dropdown.Item
										textValue="Visualizar"
										onPress={() => onView?.(employee.id)}
									>
										<EyeIcon size={16} />
										<Label>Visualizar</Label>
									</Dropdown.Item>
									{canManage && !employee.isSoftDeleted && (
										<Dropdown.Item
											textValue="Editar"
											onPress={() => onEdit?.(employee.id)}
										>
											<PenLineIcon size={16} />
											<Label>Editar</Label>
										</Dropdown.Item>
									)}
									{canManage && employee.isSoftDeleted && (
										<Dropdown.Item
											textValue="Restaurar"
											onPress={() => onRestore?.(employee.id)}
										>
											<Undo2Icon size={16} />
											<Label>Restaurar</Label>
										</Dropdown.Item>
									)}
									{canManage && !employee.isSoftDeleted && (
										<Dropdown.Item
											textValue="Excluir"
											variant="danger"
											onPress={() => onDelete?.(employee.id)}
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
	}, [canManage, onView, onEdit, onDelete, onRestore]);

	return (
		<DataTable
			columns={columns}
			data={data}
			footerContent={<Pagination totalRecords={total} size="sm" />}
		/>
	);
};
