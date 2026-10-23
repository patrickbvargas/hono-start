import { createColumnHelper } from "@tanstack/react-table";
import { formatter } from "@/shared/lib/formatter";
import type { dataTableFeatures } from "@/shared/lib/table";
import type {
	DashboardRemunerationMonth,
	DashboardRemunerationRow,
} from "../../schemas/model";

export function getColumns(months: DashboardRemunerationMonth[]) {
	const columnHelper = createColumnHelper<
		typeof dataTableFeatures,
		DashboardRemunerationRow
	>();
	return [
		columnHelper.accessor("employeeName", {
			id: "employeeName",
			header: "Colaborador",
			meta: {
				headerClassName: "min-w-40",
				cellClassName: "whitespace-nowrap font-medium",
			},
		}),
		...months.map((month) =>
			columnHelper.accessor((row) => row.months[month.key] ?? 0, {
				id: month.key,
				header: month.label,
				cell: (context) => formatter.currency(context.getValue()),
				meta: {
					headerClassName: "min-w-32 text-right",
					cellClassName: "whitespace-nowrap text-right",
				},
			}),
		),
		columnHelper.accessor("formattedTotal", {
			id: "total",
			header: "Valor total no período",
			meta: {
				headerClassName: "min-w-40 text-right",
				cellClassName: "whitespace-nowrap text-right font-semibold",
			},
		}),
	];
}
