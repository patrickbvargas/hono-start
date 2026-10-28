import { createColumnHelper } from "@tanstack/react-table";
import { FileDownIcon, FileSpreadsheetIcon, FileTextIcon } from "lucide-react";
import * as React from "react";
import { DataTable } from "@/shared/components/data-table";
import { EntityActions } from "@/shared/components/entity-actions";
import { EntityIdTrigger } from "@/shared/components/entity-id-trigger";
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
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import type { dataTableFeatures } from "@/shared/lib/table";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import { REMUNERATION_ALLOWED_SORT_COLUMNS } from "../../constants/sorting";
import type { Remuneration } from "../../schemas/model";
import { getRemunerationLifecycleActions } from "../../utils/lifecycle-actions";

interface RemunerationTableProps {
	emptyState?: React.ReactNode;
	canManageLifecycle?: boolean;
	data: QueryPaginatedReturnType<Remuneration>;
	onOpenPage?: (id: EntityId) => void;
	onView?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onDelete?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

export const RemunerationTable = ({
	emptyState,
	canManageLifecycle = false,
	data: { data, total },
	onOpenPage,
	onView,
	onEdit,
	onDelete,
	onRestore,
}: RemunerationTableProps) => {
	const renderActions = React.useCallback(
		(
			remuneration: Remuneration,
			presentation: "dropdown" | "context" = "dropdown",
		) => {
			const actions = getRemunerationLifecycleActions({
				canManageLifecycle,
				isSoftDeleted: remuneration.isSoftDeleted,
			});

			return (
				<EntityActions
					presentation={presentation}
					onOpenPage={
						onOpenPage ? () => onOpenPage(remuneration.id) : undefined
					}
					viewPermission={[
						"org:remunerations:read_all",
						"org:remunerations:read_own",
					]}
					editPermission="org:remunerations:update"
					restorePermission="org:remunerations:restore"
					deletePermission="org:remunerations:delete"
					canEdit={actions.canEdit}
					canRestore={actions.canRestore}
					canDelete={actions.canDelete}
					onView={onView ? () => onView(remuneration.id) : undefined}
					onEdit={onEdit ? () => onEdit(remuneration.id) : undefined}
					onRestore={onRestore ? () => onRestore(remuneration.id) : undefined}
					onDelete={onDelete ? () => onDelete(remuneration.id) : undefined}
				/>
			);
		},
		[canManageLifecycle, onOpenPage, onDelete, onEdit, onRestore, onView],
	);

	const columns = React.useMemo(() => {
		const c = createColumnHelper<typeof dataTableFeatures, Remuneration>();

		return [
			c.accessor("id", {
				header: "#",
				cell: ({ row }) => <EntityIdTrigger id={row.original.id} />,
				enableSorting: REMUNERATION_ALLOWED_SORT_COLUMNS.includes("id"),
				meta: {
					headerClassName: "w-18",
					cellClassName: "whitespace-nowrap",
				},
			}),
			c.accessor("employeeName", {
				cell: (context) => (
					<EntityIdTrigger
						id={context.row.original.id}
						label={context.getValue()}
					/>
				),
				header: "Colaborador",
				meta: { minColumnWidth: 180 },
				enableSorting:
					REMUNERATION_ALLOWED_SORT_COLUMNS.includes("employeeName"),
			}),
			c.accessor("contractProcessNumber", {
				header: "Processo",
				meta: { minColumnWidth: 180 },
			}),
			c.accessor("paymentDate", {
				header: "Data de recebimento",
				cell: ({ row }) => formatter.calendarDate(row.original.paymentDate),
				enableSorting:
					REMUNERATION_ALLOWED_SORT_COLUMNS.includes("paymentDate"),
			}),
			c.accessor("amount", {
				header: "Valor",
				cell: ({ row }) => (
					<SensitiveValue>
						{formatter.currency(row.original.amount)}
					</SensitiveValue>
				),
				enableSorting: REMUNERATION_ALLOWED_SORT_COLUMNS.includes("amount"),
				meta: {
					cellClassName: "text-right",
				},
			}),
			c.accessor("effectivePercentage", {
				header: "Percentual efetivo (%)",
				cell: ({ row }) => formatter.percent(row.original.effectivePercentage),
				enableSorting: REMUNERATION_ALLOWED_SORT_COLUMNS.includes(
					"effectivePercentage",
				),
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
			emptyState={emptyState}
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
					<FileTextIcon size={16} aria-hidden="true" />
					{pendingFormat === "pdf" ? "Gerando PDF..." : "PDF"}
				</DropdownMenuItem>
				<DropdownMenuItem
					disabled={isPending}
					onClick={() => onExport("spreadsheet")}
				>
					<FileSpreadsheetIcon size={16} aria-hidden="true" />
					{pendingFormat === "spreadsheet"
						? "Gerando planilha..."
						: "Planilha (.csv)"}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
