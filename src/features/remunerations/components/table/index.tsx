import { createColumnHelper } from "@tanstack/react-table";
import { FileDownIcon } from "lucide-react";
import * as React from "react";
import { DataTable } from "@/shared/components/data-table";
import { EntityActions } from "@/shared/components/entity-actions";
import { EntityStatus } from "@/shared/components/entity-status";
import { Pagination } from "@/shared/components/pagination";
import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Spinner,
} from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import { REMUNERATION_ALLOWED_SORT_COLUMNS } from "../../constants/sorting";
import type { Remuneration } from "../../schemas/model";

interface RemunerationTableProps {
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
						<EntityActions
							canEdit={canManageLifecycle && !remuneration.isSoftDeleted}
							canRestore={canManageLifecycle && remuneration.isSoftDeleted}
							canDelete={canManageLifecycle && !remuneration.isSoftDeleted}
							onView={() => onView?.(remuneration)}
							onEdit={() => onEdit?.(remuneration)}
							onRestore={() => onRestore?.(remuneration)}
							onDelete={() => onDelete?.(remuneration)}
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

interface RemunerationExportMenuProps {
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
		<DropdownMenu>
			<DropdownMenuTrigger
				render={<Button size="sm" variant="outline" disabled={isPending} />}
			>
				{isPending ? <Spinner /> : <FileDownIcon size={16} />}
				Exportar
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem disabled={isPending} onClick={() => onExport("pdf")}>
					{pendingFormat === "pdf" ? "Gerando PDF..." : "PDF"}
				</DropdownMenuItem>
				<DropdownMenuItem
					disabled={isPending}
					onClick={() => onExport("spreadsheet")}
				>
					{pendingFormat === "spreadsheet"
						? "Gerando planilha..."
						: "Planilha (.csv)"}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
