import { createColumnHelper } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { EntityIdTrigger } from "@/shared/components/entity-id-trigger";
import { EntityStatus } from "@/shared/components/entity-status";
import type { dataTableFeatures } from "@/shared/lib/table";
import { CLIENT_ALLOWED_SORT_COLUMNS } from "../../constants/sorting";
import type { ClientSummary } from "../../schemas/model";
import { formatClientDocument } from "../../utils/format";

export function getClientTableColumns(
	renderActions: (row: ClientSummary) => ReactNode,
) {
	const c = createColumnHelper<typeof dataTableFeatures, ClientSummary>();

	return [
		c.accessor("id", {
			header: "#",
			cell: ({ row }) => <EntityIdTrigger id={row.original.id} />,
			enableSorting: CLIENT_ALLOWED_SORT_COLUMNS.includes("id"),
			meta: {
				headerClassName: "w-18",
				cellClassName: "whitespace-nowrap",
			},
		}),
		c.accessor("fullName", {
			cell: (context) => (
				<EntityIdTrigger
					id={context.row.original.id}
					label={context.getValue()}
				/>
			),
			header: "Nome",
			enableSorting: CLIENT_ALLOWED_SORT_COLUMNS.includes("fullName"),
			meta: {
				minColumnWidth: 280,
			},
		}),
		c.accessor("document", {
			header: "Documento",
			cell: ({ row }) => formatClientDocument(row.original.document),
			enableSorting: CLIENT_ALLOWED_SORT_COLUMNS.includes("document"),
		}),
		c.accessor("type", {
			header: "Tipo",
			enableSorting: CLIENT_ALLOWED_SORT_COLUMNS.includes("type"),
		}),
		c.accessor("contractCount", {
			header: "Contratos",
			enableSorting: false,
		}),
		c.accessor("isActive", {
			header: "Situação",
			cell: ({ row }) => (
				<EntityStatus
					isActive={row.original.isActive}
					isSoftDeleted={row.original.isSoftDeleted}
				/>
			),
			enableSorting: CLIENT_ALLOWED_SORT_COLUMNS.includes("isActive"),
		}),
		c.display({
			id: "actions",
			cell: ({ row }) => renderActions(row.original),
			meta: {
				cellClassName: "w-11",
			},
		}),
	];
}
