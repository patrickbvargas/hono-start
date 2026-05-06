import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/shared/components/data-table";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import type { DashboardSummary } from "../../schemas/model";

interface DashboardRemunerationTableProps {
	months: DashboardSummary["remunerationMonths"];
	rows: DashboardSummary["remunerationTable"];
}

const EMPTY_LABEL =
	"Nenhuma remuneração encontrada para os filtros selecionados.";

export function DashboardRemunerationTable({
	months,
	rows,
}: DashboardRemunerationTableProps) {
	const columnHelper =
		createColumnHelper<DashboardSummary["remunerationTable"][number]>();
	const columns = [
		columnHelper.accessor("employeeName", {
			id: "employeeName",
			header: "Colaborador",
			meta: {
				headerClassName: "min-w-56",
				cellClassName: "whitespace-nowrap font-medium",
			},
		}),
		...months.map((month) =>
			columnHelper.accessor((row) => row.months[month.key] ?? 0, {
				id: month.key,
				header: month.label,
				cell: ({ getValue }) => formatter.currency(getValue()),
				meta: {
					headerClassName: "min-w-32 text-right",
					cellClassName: "whitespace-nowrap text-right",
				},
			}),
		),
		columnHelper.accessor("formattedTotal", {
			id: "total",
			header: "Total no período",
			meta: {
				headerClassName: "min-w-40 text-right",
				cellClassName: "whitespace-nowrap text-right font-semibold",
			},
		}),
	];

	return (
		<Card className="h-80">
			<CardHeader>
				<CardTitle>Remunerações</CardTitle>
			</CardHeader>
			<CardContent className="flex min-h-0 flex-1 flex-col pt-0">
				{rows.length === 0 ? (
					<div className="flex min-h-0 flex-1 items-center justify-center">
						<p className="text-sm text-muted-foreground">{EMPTY_LABEL}</p>
					</div>
				) : (
					<DataTable columns={columns} data={rows} />
				)}
			</CardContent>
		</Card>
	);
}
