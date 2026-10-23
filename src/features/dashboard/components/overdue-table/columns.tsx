import { createColumnHelper } from "@tanstack/react-table";
import { formatter } from "@/shared/lib/formatter";
import type { dataTableFeatures } from "@/shared/lib/table";
import type { DashboardOverdueInstallmentRow } from "../../schemas/model";

export function getColumns() {
	const columnHelper = createColumnHelper<
		typeof dataTableFeatures,
		DashboardOverdueInstallmentRow
	>();
	return [
		columnHelper.accessor("contractProcessNumber", {
			header: "Processo",
			meta: {
				headerClassName: "min-w-44",
				cellClassName: "whitespace-nowrap font-medium",
			},
		}),
		columnHelper.accessor("clientName", {
			header: "Cliente",
			meta: {
				headerClassName: "min-w-56",
				cellClassName: "whitespace-nowrap",
			},
		}),
		columnHelper.accessor("lawyerName", {
			header: "Advogado",
			meta: {
				headerClassName: "min-w-44",
				cellClassName: "whitespace-nowrap",
			},
		}),
		columnHelper.accessor("legalArea", {
			header: "Área",
			meta: {
				headerClassName: "min-w-36",
				cellClassName: "whitespace-nowrap",
			},
		}),
		columnHelper.accessor("revenueType", {
			header: "Tipo receita",
			meta: {
				headerClassName: "min-w-36",
				cellClassName: "whitespace-nowrap",
			},
		}),
		columnHelper.accessor("installmentNumber", {
			header: "Parcela",
			meta: {
				headerClassName: "min-w-24 text-right",
				cellClassName: "whitespace-nowrap text-right",
			},
		}),
		columnHelper.accessor("dueDate", {
			header: "Vencimento",
			cell: (context) => formatter.date(context.getValue()),
			meta: {
				headerClassName: "min-w-32",
				cellClassName: "whitespace-nowrap",
			},
		}),
		columnHelper.accessor("formattedInstallmentAmount", {
			id: "formattedInstallmentAmount",
			header: "Valor parcela",
			meta: {
				headerClassName: "min-w-32 text-right",
				cellClassName: "whitespace-nowrap text-right",
			},
		}),
		columnHelper.accessor("formattedTotalValue", {
			id: "formattedTotalValue",
			header: "Valor total",
			meta: {
				headerClassName: "min-w-32 text-right",
				cellClassName: "whitespace-nowrap text-right font-semibold",
			},
		}),
	];
}
