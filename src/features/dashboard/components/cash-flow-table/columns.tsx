import { createColumnHelper } from "@tanstack/react-table";
import { formatter } from "@/shared/lib/formatter";
import type { dataTableFeatures } from "@/shared/lib/table";
import type { DashboardCashFlowRow } from "../../schemas/model";

export function getColumns() {
	const columnHelper = createColumnHelper<
		typeof dataTableFeatures,
		DashboardCashFlowRow
	>();
	return [
		columnHelper.accessor("monthLabel", {
			id: "monthLabel",
			header: "Mês",
			meta: {
				headerClassName: "min-w-28",
				cellClassName: "whitespace-nowrap font-medium",
			},
		}),
		columnHelper.accessor("administrative", {
			header: "Administrativo",
			cell: (context) => formatter.currency(context.getValue()),
			meta: {
				headerClassName: "min-w-32 text-right",
				cellClassName: "whitespace-nowrap text-right",
			},
		}),
		columnHelper.accessor("judicial", {
			header: "Judicial",
			cell: (context) => formatter.currency(context.getValue()),
			meta: {
				headerClassName: "min-w-32 text-right",
				cellClassName: "whitespace-nowrap text-right",
			},
		}),
		columnHelper.accessor("succumbency", {
			header: "Sucumbência",
			cell: (context) => formatter.currency(context.getValue()),
			meta: {
				headerClassName: "min-w-32 text-right",
				cellClassName: "whitespace-nowrap text-right",
			},
		}),
		columnHelper.accessor("entry", {
			header: "Entrada",
			cell: (context) => formatter.currency(context.getValue()),
			meta: {
				headerClassName: "min-w-32 text-right",
				cellClassName: "whitespace-nowrap text-right font-semibold",
			},
		}),
		columnHelper.accessor("remuneration", {
			header: "Remuneração",
			cell: (context) => formatter.currency(context.getValue()),
			meta: {
				headerClassName: "min-w-32 text-right",
				cellClassName: "whitespace-nowrap text-right",
			},
		}),
		columnHelper.accessor("expense", {
			header: "Despesa",
			cell: (context) => formatter.currency(context.getValue()),
			meta: {
				headerClassName: "min-w-32 text-right",
				cellClassName: "whitespace-nowrap text-right",
			},
		}),
		columnHelper.accessor("output", {
			header: "Saída",
			cell: (context) => formatter.currency(context.getValue()),
			meta: {
				headerClassName: "min-w-32 text-right",
				cellClassName: "whitespace-nowrap text-right font-semibold",
			},
		}),
		columnHelper.accessor("balance", {
			header: "Saldo",
			cell: (context) => formatter.currency(context.getValue()),
			meta: {
				headerClassName: "min-w-32 text-right",
				cellClassName: "whitespace-nowrap text-right font-semibold",
			},
		}),
	];
}
