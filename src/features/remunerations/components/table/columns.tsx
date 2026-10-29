import { createColumnHelper } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { EntityIdTrigger } from "@/shared/components/entity-id-trigger";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import type { dataTableFeatures } from "@/shared/lib/table";
import { REMUNERATION_ALLOWED_SORT_COLUMNS } from "../../constants/sorting";
import type { Remuneration } from "../../schemas/model";

export function getRemunerationTableColumns(
	renderActions: (row: Remuneration) => ReactNode,
) {
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
			enableSorting: REMUNERATION_ALLOWED_SORT_COLUMNS.includes("employeeName"),
		}),
		c.accessor("contractProcessNumber", {
			header: "Processo",
			meta: { minColumnWidth: 180 },
		}),
		c.accessor("paymentDate", {
			header: "Data de recebimento",
			cell: ({ row }) => formatter.calendarDate(row.original.paymentDate),
			enableSorting: REMUNERATION_ALLOWED_SORT_COLUMNS.includes("paymentDate"),
		}),
		c.accessor("effectivePercentage", {
			header: "Percentual efetivo (%)",
			cell: ({ row }) => formatter.percent(row.original.effectivePercentage),
			enableSorting: REMUNERATION_ALLOWED_SORT_COLUMNS.includes(
				"effectivePercentage",
			),
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
		c.display({
			id: "actions",
			cell: ({ row }) => renderActions(row.original),
			meta: {
				cellClassName: "w-11",
			},
		}),
	];
}
