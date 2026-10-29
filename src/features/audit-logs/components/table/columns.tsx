import { createColumnHelper } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { EntityIdTrigger } from "@/shared/components/entity-id-trigger";
import type { dataTableFeatures } from "@/shared/lib/table";
import { AUDIT_ACTION_LABELS } from "../../constants/display";
import { AUDIT_LOG_ALLOWED_SORT_COLUMNS } from "../../constants/sort";
import type { AuditLog } from "../../schemas/model";

export function getAuditLogTableColumns(
	renderActions: (row: AuditLog) => ReactNode,
	canOpen: boolean,
) {
	const c = createColumnHelper<typeof dataTableFeatures, AuditLog>();

	return [
		c.accessor("id", {
			header: "#",
			cell: ({ row }) =>
				canOpen ? (
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
}
