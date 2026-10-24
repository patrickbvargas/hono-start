import { createColumnHelper } from "@tanstack/react-table";
import { formatter } from "@/shared/lib/formatter";
import type { dataTableFeatures } from "@/shared/lib/table";
import type { DashboardCashFlowRow } from "../../schemas/model";

export type CashFlowValue = Exclude<
	keyof DashboardCashFlowRow,
	"month" | "monthLabel"
>;
export interface CashFlowSelectionOptions {
	onSelect?: (
		row: DashboardCashFlowRow,
		column: CashFlowValue,
		trigger: HTMLElement,
	) => void;
}

export function getColumns(onSelect?: CashFlowSelectionOptions["onSelect"]) {
	const renderValue = (row: DashboardCashFlowRow, column: CashFlowValue) =>
		onSelect ? (
			<button
				type="button"
				className="cursor-pointer rounded-sm px-1 -mx-1 transition-colors hover:bg-accent/30 hover:ring-1 hover:ring-ring/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				aria-label={`Detalhar ${labels[column]} em ${row.monthLabel}`}
				title={`Ver detalhes: ${labels[column]} · ${row.monthLabel}`}
				onClick={(event) => onSelect(row, column, event.currentTarget)}
			>
				{formatter.currency(row[column])}
			</button>
		) : (
			formatter.currency(row[column])
		);
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
			cell: (context) => renderValue(context.row.original, "administrative"),
			meta: {
				headerClassName: "min-w-32 text-right",
				cellClassName: "whitespace-nowrap text-right",
			},
		}),
		columnHelper.accessor("judicial", {
			header: "Judicial",
			cell: (context) => renderValue(context.row.original, "judicial"),
			meta: {
				headerClassName: "min-w-32 text-right",
				cellClassName: "whitespace-nowrap text-right",
			},
		}),
		columnHelper.accessor("succumbency", {
			header: "Sucumbência",
			cell: (context) => renderValue(context.row.original, "succumbency"),
			meta: {
				headerClassName: "min-w-32 text-right",
				cellClassName: "whitespace-nowrap text-right",
			},
		}),
		columnHelper.accessor("entry", {
			header: labels.entry,
			cell: (context) => renderValue(context.row.original, "entry"),
			meta: {
				headerClassName: "min-w-32 text-right",
				cellClassName: "whitespace-nowrap text-right font-semibold",
			},
		}),
		columnHelper.accessor("output", {
			header: labels.output,
			cell: (context) => renderValue(context.row.original, "output"),
			meta: {
				headerClassName: "min-w-32 text-right",
				cellClassName: "whitespace-nowrap text-right font-semibold",
			},
		}),
		columnHelper.accessor("balance", {
			header: labels.balance,
			cell: (context) => renderValue(context.row.original, "balance"),
			meta: {
				headerClassName: "min-w-32 text-right",
				cellClassName: "whitespace-nowrap text-right font-semibold",
			},
		}),
	];
}

export const cashFlowDrilldownSeries = {
	administrative: { series: "revenue", revenueType: "ADMINISTRATIVE" },
	judicial: { series: "revenue", revenueType: "JUDICIAL" },
	succumbency: { series: "revenue", revenueType: "SUCCUMBENCY" },
	entry: { series: "revenue" },
	remuneration: { series: "remuneration" },
	expense: { series: "expense" },
	output: { series: "output" },
	balance: { series: "result" },
} as const;

export const labels: Record<CashFlowValue, string> = {
	administrative: "Administrativo",
	judicial: "Judicial",
	succumbency: "Sucumbência",
	entry: "Entradas",
	remuneration: "Remuneração gerada",
	expense: "Despesas",
	output: "Saídas",
	balance: "Resultado",
};
