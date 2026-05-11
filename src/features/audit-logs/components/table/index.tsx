import { createColumnHelper } from "@tanstack/react-table";
import * as React from "react";
import { DataTable } from "@/shared/components/data-table";
import { EntityIdTrigger } from "@/shared/components/entity-id-trigger";
import { Pagination } from "@/shared/components/pagination";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import { AUDIT_LOG_ALLOWED_SORT_COLUMNS } from "../../constants/sort";
import type { AuditLog } from "../../schemas/model";

interface AuditLogTableProps {
	data: QueryPaginatedReturnType<AuditLog>;
	onView?: (id: EntityId) => void;
}

export const AuditLogTable = ({
	data: { data, total },
	onView,
}: AuditLogTableProps) => {
	const columns = React.useMemo(() => {
		const c = createColumnHelper<AuditLog>();

		return [
			c.accessor("id", {
				header: "#",
				cell: ({ row }) =>
					onView ? (
						<EntityIdTrigger id={row.original.id} onView={onView} />
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
			c.accessor("occurredAt", {
				header: "Data",
				cell: ({ row }) => row.original.occurredAtLabel,
				enableSorting: AUDIT_LOG_ALLOWED_SORT_COLUMNS.includes("occurredAt"),
			}),
			c.accessor("actorName", {
				header: "Usuário",
				enableSorting: AUDIT_LOG_ALLOWED_SORT_COLUMNS.includes("actorName"),
				meta: {
					minColumnWidth: 220,
				},
			}),
			c.accessor("action", {
				header: "Ação",
				enableSorting: AUDIT_LOG_ALLOWED_SORT_COLUMNS.includes("action"),
			}),
			c.accessor("entityType", {
				header: "Tipo",
				cell: ({ row }) => row.original.entityTypeLabel,
				enableSorting: AUDIT_LOG_ALLOWED_SORT_COLUMNS.includes("entityType"),
			}),
			c.accessor("entityName", {
				header: "Registro",
				enableSorting: AUDIT_LOG_ALLOWED_SORT_COLUMNS.includes("entityName"),
				meta: {
					minColumnWidth: 240,
				},
			}),
			c.accessor("ipAddress", {
				header: "IP",
				cell: ({ getValue }) => getValue() ?? "-",
				enableSorting: false,
			}),
			c.accessor("description", {
				header: "Descrição",
				enableSorting: false,
				meta: {
					minColumnWidth: 360,
				},
			}),
		];
	}, [onView]);

	return (
		<DataTable
			columns={columns}
			data={data}
			footerContent={<Pagination totalRecords={total} />}
		/>
	);
};
