import { createColumnHelper } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { EntityIdTrigger } from "@/shared/components/entity-id-trigger";
import { EntityStatus } from "@/shared/components/entity-status";
import type { dataTableFeatures } from "@/shared/lib/table";
import { PERSON_ALLOWED_SORT_COLUMNS } from "../../constants/sorting";
import type { PersonSummary } from "../../schemas/model";
import { formatPersonDocument } from "../../utils/format";

export function getPersonTableColumns(
	renderActions: (row: PersonSummary) => ReactNode,
) {
	const c = createColumnHelper<typeof dataTableFeatures, PersonSummary>();

	return [
		c.accessor("id", {
			header: "#",
			cell: ({ row }) => <EntityIdTrigger id={row.original.id} />,
			enableSorting: PERSON_ALLOWED_SORT_COLUMNS.includes("id"),
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
			enableSorting: PERSON_ALLOWED_SORT_COLUMNS.includes("fullName"),
			meta: {
				minColumnWidth: 280,
			},
		}),
		c.accessor("document", {
			header: "Documento",
			cell: ({ row }) => formatPersonDocument(row.original.document),
			enableSorting: PERSON_ALLOWED_SORT_COLUMNS.includes("document"),
		}),
		c.accessor("type", {
			header: "Tipo",
			enableSorting: PERSON_ALLOWED_SORT_COLUMNS.includes("type"),
		}),
		c.accessor("roles", {
			header: "Papéis",
			cell: (context) => context.getValue().join(", "),
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
			enableSorting: PERSON_ALLOWED_SORT_COLUMNS.includes("isActive"),
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
