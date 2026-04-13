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
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import {
	CONTRACT_ALLOWED_SORT_COLUMNS,
	CONTRACT_STATUS_CANCELLED_VALUE,
	CONTRACT_STATUS_COMPLETED_VALUE,
} from "../../constants";
import type { Contract } from "../../schemas/model";

export interface ContractTableProps {
	canManageLifecycle?: boolean;
	data: QueryPaginatedReturnType<Contract>;
	onView?: (contract: Contract) => void;
	onEdit?: (contract: Contract) => void;
	onDelete?: (contract: Contract) => void;
	onRestore?: (contract: Contract) => void;
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
		const c = createColumnHelper<Contract>();

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
						<Dropdown>
							<Button isIconOnly size="sm" variant="ghost" aria-label="Ações">
								<EllipsisVerticalIcon size={16} />
							</Button>
							<Dropdown.Popover placement="bottom end">
								<Dropdown.Menu>
									<Dropdown.Item
										textValue="Visualizar"
										onPress={() => onView?.(contract)}
									>
										<EyeIcon size={16} />
										<Label>Visualizar</Label>
									</Dropdown.Item>
									{canEditContract && (
										<Dropdown.Item
											textValue="Editar"
											onPress={() => onEdit?.(contract)}
										>
											<PenLineIcon size={16} />
											<Label>Editar</Label>
										</Dropdown.Item>
									)}
									{canManageLifecycle && contract.isSoftDeleted && (
										<Dropdown.Item
											textValue="Restaurar"
											onPress={() => onRestore?.(contract)}
										>
											<Undo2Icon size={16} />
											<Label>Restaurar</Label>
										</Dropdown.Item>
									)}
									{canManageLifecycle && !contract.isSoftDeleted && (
										<Dropdown.Item
											textValue="Excluir"
											variant="danger"
											onPress={() => onDelete?.(contract)}
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
	}, [canManageLifecycle, onDelete, onEdit, onRestore, onView]);

	return (
		<DataTable
			columns={columns}
			data={data}
			footerContent={<Pagination totalRecords={total} size="sm" />}
		/>
	);
};
