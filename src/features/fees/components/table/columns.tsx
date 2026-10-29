import { createColumnHelper } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { EntityIdTrigger } from "@/shared/components/entity-id-trigger";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import type { dataTableFeatures } from "@/shared/lib/table";
import { FEE_ALLOWED_SORT_COLUMNS } from "../../constants/sorting";
import type { FeeSummary } from "../../schemas/model";

export function getFeeTableColumns(
	renderActions: (row: FeeSummary) => ReactNode,
) {
	const c = createColumnHelper<typeof dataTableFeatures, FeeSummary>();

	return [
		c.accessor("id", {
			header: "#",
			cell: ({ row }) => <EntityIdTrigger id={row.original.id} />,
			enableSorting: FEE_ALLOWED_SORT_COLUMNS.includes("id"),
			meta: {
				headerClassName: "w-18",
				cellClassName: "whitespace-nowrap",
			},
		}),
		c.accessor("contractProcessNumber", {
			cell: (context) => (
				<EntityIdTrigger
					id={context.row.original.id}
					label={context.getValue()}
				/>
			),
			header: "Processo",
			meta: { minColumnWidth: 180 },
		}),
		c.accessor("revenueType", {
			header: "Tipo de honorário",
			meta: { minColumnWidth: 160 },
		}),
		c.accessor("paymentDate", {
			header: "Data de recebimento",
			cell: ({ row }) => formatter.calendarDate(row.original.paymentDate),
			enableSorting: FEE_ALLOWED_SORT_COLUMNS.includes("paymentDate"),
		}),
		c.accessor("installmentNumber", {
			header: "Nº da parcela",
			enableSorting: FEE_ALLOWED_SORT_COLUMNS.includes("installmentNumber"),
		}),
		c.accessor("amount", {
			header: "Valor",
			cell: ({ row }) => (
				<SensitiveValue>
					{formatter.currency(row.original.amount)}
				</SensitiveValue>
			),
			enableSorting: FEE_ALLOWED_SORT_COLUMNS.includes("amount"),
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
