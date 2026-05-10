import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/shared/components/data-table";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	TableCell,
	TableRow,
} from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import type { DashboardSummary } from "../../schemas/model";

interface DashboardRemunerationTableProps {
	months: DashboardSummary["remunerationMonths"];
	rows: DashboardSummary["remunerationTable"];
	subtotal: DashboardSummary["remunerationSubtotal"];
}

const EMPTY_LABEL =
	"Nenhuma remuneração encontrada para os filtros selecionados.";

export function DashboardRemunerationTable({
	months,
	rows,
	subtotal,
}: DashboardRemunerationTableProps) {
	const columnHelper =
		createColumnHelper<DashboardSummary["remunerationTable"][number]>();
	const columns = [
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
		<Card className="hidden sm:block">
			<CardHeader>
				<CardTitle>Remunerações</CardTitle>
			</CardHeader>
			<CardContent className="flex min-h-0 flex-1 flex-col pt-0">
				<DataTable
					columns={columns}
					data={rows}
					emptyMessage={EMPTY_LABEL}
					tableFooterContent={
						subtotal ? (
							<TableRow className="hover:bg-transparent">
								<TableCell className="whitespace-nowrap font-semibold">
									{subtotal.label}
								</TableCell>
								{months.map((month) => (
									<TableCell
										key={month.key}
										className="whitespace-nowrap text-right font-semibold"
									>
										{formatter.currency(subtotal.months[month.key] ?? 0)}
									</TableCell>
								))}
								<TableCell className="whitespace-nowrap text-right font-semibold">
									{subtotal.formattedTotal}
								</TableCell>
							</TableRow>
						) : null
					}
				/>
			</CardContent>
		</Card>
	);
}
