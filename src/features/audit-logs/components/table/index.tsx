import { createColumnHelper } from "@tanstack/react-table";
import * as React from "react";
import { DataTable } from "@/shared/components/data-table";
import { EntityActions } from "@/shared/components/entity-actions";
import { EntityIdTrigger } from "@/shared/components/entity-id-trigger";
import { Pagination } from "@/shared/components/pagination";
import type { dataTableFeatures } from "@/shared/lib/table";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import { AUDIT_ACTION_LABELS } from "../../constants/display";
import { AUDIT_LOG_ALLOWED_SORT_COLUMNS } from "../../constants/sort";
import type { AuditLog } from "../../schemas/model";

interface AuditLogTableProps {
	emptyState?: React.ReactNode;
	data: QueryPaginatedReturnType<AuditLog>;
	onOpenPage?: (id: EntityId) => void;
	onView?: (id: EntityId) => void;
}

export const AuditLogTable = ({
	emptyState,
	data: { data, total },
	onOpenPage,
	onView,
}: AuditLogTableProps) => {
	const renderActions = React.useCallback(
		(auditLog: AuditLog, presentation: "dropdown" | "context" = "dropdown") => {
			return (
				<EntityActions
					presentation={presentation}
					viewPermission="org:audit_logs:read"
					onOpenPage={onOpenPage ? () => onOpenPage(auditLog.id) : undefined}
					onView={onView ? () => onView(auditLog.id) : undefined}
				/>
			);
		},
		[onView, onOpenPage],
	);

	const columns = React.useMemo(() => {
		const c = createColumnHelper<typeof dataTableFeatures, AuditLog>();

		return [
			c.accessor("id", {
				header: "#",
				cell: ({ row }) =>
					(onOpenPage ?? onView) ? (
						<EntityIdTrigger id={row.original.id} />
					) : (
						<span className="font-mono text-muted-foreground">
							#{row.original.id}
						</span>
					),
				meta: {
					headerClassName: "w-18",
					cellClassName: "whitespace-nowrap",
				},
			}),
			c.accessor("action", {
				header: "Ação",
				cell: (context) =>
					AUDIT_ACTION_LABELS[context.getValue()] ?? context.getValue() ?? "—",
				enableSorting: AUDIT_LOG_ALLOWED_SORT_COLUMNS.includes("action"),
			}),
			c.accessor("occurredAt", {
				header: "Ocorrido em",
				cell: ({ row }) => row.original.occurredAtLabel || "—",
				enableSorting: AUDIT_LOG_ALLOWED_SORT_COLUMNS.includes("occurredAt"),
			}),
			c.accessor("actorName", {
				header: "Usuário",
				cell: (context) => context.getValue() || "Sistema",
				enableSorting: AUDIT_LOG_ALLOWED_SORT_COLUMNS.includes("actorName"),
				meta: {
					minColumnWidth: 220,
				},
			}),
			c.accessor("entityType", {
				header: "Tipo",
				cell: ({ row }) => {
					const isSystemEvent =
						!row.original.entityName &&
						!row.original.entityTypeLabel &&
						!row.original.actorName;

					return (
						row.original.entityTypeLabel || (isSystemEvent ? "Sistema" : "—")
					);
				},
				enableSorting: AUDIT_LOG_ALLOWED_SORT_COLUMNS.includes("entityType"),
			}),
			c.accessor("entityName", {
				header: "Entidade",
				cell: ({ row }) => {
					const isSystemEvent =
						!row.original.entityName &&
						!row.original.entityTypeLabel &&
						!row.original.actorName;

					const label =
						row.original.entityName || (isSystemEvent ? "Sistema" : "—");
					return <EntityIdTrigger id={row.original.id} label={label} />;
				},
				enableSorting: AUDIT_LOG_ALLOWED_SORT_COLUMNS.includes("entityName"),
				meta: {
					minColumnWidth: 240,
				},
			}),
			c.accessor("description", {
				header: "Detalhes",
				cell: (context) => context.getValue() || "—",
				enableSorting: false,
				meta: {
					minColumnWidth: 360,
				},
			}),
			c.accessor("ipAddress", {
				header: "Endereço IP",
				cell: (context) => context.getValue() ?? "—",
				enableSorting: false,
			}),
			c.display({
				id: "actions",
				cell: ({ row }) => renderActions(row.original),
				meta: { cellClassName: "w-11" },
			}),
		];
	}, [renderActions, onOpenPage, onView]);

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
