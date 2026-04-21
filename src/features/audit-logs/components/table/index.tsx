import { createColumnHelper } from "@tanstack/react-table";
import * as React from "react";
import { DataTable } from "@/shared/components/data-table";
import { Pagination } from "@/shared/components/pagination";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import { AUDIT_LOG_ALLOWED_SORT_COLUMNS } from "../../constants/sort";
import type { AuditLog } from "../../schemas/model";

interface AuditLogTableProps {
	data: QueryPaginatedReturnType<AuditLog>;
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
	dateStyle: "short",
	timeStyle: "short",
});

export const AuditLogTable = ({
	data: { data, total },
}: AuditLogTableProps) => {
	const columns = React.useMemo(() => {
		const c = createColumnHelper<AuditLog>();

		return [
			c.accessor("occurredAt", {
				header: "Data",
				cell: ({ getValue }) => dateFormatter.format(new Date(getValue())),
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
	}, []);

	return (
		<DataTable
			columns={columns}
			data={data}
			footerContent={<Pagination totalRecords={total} size="sm" />}
		/>
	);
};
