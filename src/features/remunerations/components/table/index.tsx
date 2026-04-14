import { createColumnHelper } from "@tanstack/react-table";
import {
	EllipsisVerticalIcon,
	EyeIcon,
	FileDownIcon,
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
import { REMUNERATION_ALLOWED_SORT_COLUMNS } from "../../constants";
import type { Remuneration } from "../../schemas/model";

export interface RemunerationTableProps {
	canManageLifecycle?: boolean;
	data: QueryPaginatedReturnType<Remuneration>;
	onView?: (remuneration: Remuneration) => void;
	onEdit?: (remuneration: Remuneration) => void;
	onDelete?: (remuneration: Remuneration) => void;
	onRestore?: (remuneration: Remuneration) => void;
}

export const RemunerationTable = ({
	canManageLifecycle = false,
	data: { data, total },
	onView,
	onEdit,
	onDelete,
	onRestore,
}: RemunerationTableProps) => {
	const columns = React.useMemo(() => {
		const c = createColumnHelper<Remuneration>();

		return [
			c.accessor("employeeName", {
				header: "Colaborador",
				meta: { minColumnWidth: 180 },
				enableSorting:
					REMUNERATION_ALLOWED_SORT_COLUMNS.includes("employeeName"),
			}),
			c.accessor("contractProcessNumber", {
				header: "Contrato",
				meta: { minColumnWidth: 180 },
			}),
			c.accessor("paymentDate", {
				header: "Pagamento",
				cell: ({ row }) => formatter.date(row.original.paymentDate),
				enableSorting:
					REMUNERATION_ALLOWED_SORT_COLUMNS.includes("paymentDate"),
			}),
			c.accessor("amount", {
				header: "Valor",
				cell: ({ row }) => formatter.currency(row.original.amount),
				enableSorting: REMUNERATION_ALLOWED_SORT_COLUMNS.includes("amount"),
			}),
			c.accessor("effectivePercentage", {
				header: "Percentual",
				cell: ({ row }) => formatter.percent(row.original.effectivePercentage),
				enableSorting: REMUNERATION_ALLOWED_SORT_COLUMNS.includes(
					"effectivePercentage",
				),
			}),
			c.accessor("isManualOverride", {
				header: "Origem",
				cell: ({ row }) =>
					row.original.isManualOverride ? "Manual" : "Automática",
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
				enableSorting: REMUNERATION_ALLOWED_SORT_COLUMNS.includes("createdAt"),
			}),
			c.display({
				id: "actions",
				header: "Ações",
				cell: ({ row }) => {
					const remuneration = row.original;

					return (
						<Dropdown>
							<Button isIconOnly size="sm" variant="ghost" aria-label="Ações">
								<EllipsisVerticalIcon size={16} />
							</Button>
							<Dropdown.Popover placement="bottom end">
								<Dropdown.Menu>
									<Dropdown.Item
										textValue="Visualizar"
										onPress={() => onView?.(remuneration)}
									>
										<EyeIcon size={16} />
										<Label>Visualizar</Label>
									</Dropdown.Item>
									{canManageLifecycle && !remuneration.isSoftDeleted ? (
										<Dropdown.Item
											textValue="Editar"
											onPress={() => onEdit?.(remuneration)}
										>
											<PenLineIcon size={16} />
											<Label>Editar</Label>
										</Dropdown.Item>
									) : null}
									{canManageLifecycle && remuneration.isSoftDeleted ? (
										<Dropdown.Item
											textValue="Restaurar"
											onPress={() => onRestore?.(remuneration)}
										>
											<Undo2Icon size={16} />
											<Label>Restaurar</Label>
										</Dropdown.Item>
									) : null}
									{canManageLifecycle && !remuneration.isSoftDeleted ? (
										<Dropdown.Item
											textValue="Excluir"
											variant="danger"
											onPress={() => onDelete?.(remuneration)}
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

export interface RemunerationExportMenuProps {
	onExport: (format: "pdf" | "spreadsheet") => void;
	isPending?: boolean;
	pendingFormat?: "pdf" | "spreadsheet" | null;
}

export const RemunerationExportMenu = ({
	onExport,
	isPending = false,
	pendingFormat = null,
}: RemunerationExportMenuProps) => {
	return (
		<Dropdown>
			<Button size="sm" variant="outline" isPending={isPending}>
				<FileDownIcon size={16} />
				Exportar
			</Button>
			<Dropdown.Popover placement="bottom end">
				<Dropdown.Menu>
					<Dropdown.Item
						textValue="Exportar PDF"
						isDisabled={isPending}
						onPress={() => onExport("pdf")}
					>
						<Label>{pendingFormat === "pdf" ? "Gerando PDF..." : "PDF"}</Label>
					</Dropdown.Item>
					<Dropdown.Item
						textValue="Exportar planilha"
						isDisabled={isPending}
						onPress={() => onExport("spreadsheet")}
					>
						<Label>
							{pendingFormat === "spreadsheet"
								? "Gerando planilha..."
								: "Planilha (.csv)"}
						</Label>
					</Dropdown.Item>
				</Dropdown.Menu>
			</Dropdown.Popover>
		</Dropdown>
	);
};
