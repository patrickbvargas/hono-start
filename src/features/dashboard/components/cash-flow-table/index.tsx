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

interface DashboardCashFlowTableProps {
	rows: NonNullable<DashboardSummary["cashFlow"]>["table"];
}

const EMPTY_LABEL = "Nenhum dado de fluxo de caixa encontrado.";

export function DashboardCashFlowTable({ rows }: DashboardCashFlowTableProps) {
	const columnHelper =
		createColumnHelper<
			NonNullable<DashboardSummary["cashFlow"]>["table"][number]
		>();
	const columns = [
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
			cell: ({ getValue }) => formatter.currency(getValue()),
			meta: {
				headerClassName: "min-w-32 text-right",
				cellClassName: "whitespace-nowrap text-right",
			},
		}),
		columnHelper.accessor("judicial", {
			header: "Judicial",
			cell: ({ getValue }) => formatter.currency(getValue()),
			meta: {
				headerClassName: "min-w-32 text-right",
				cellClassName: "whitespace-nowrap text-right",
			},
		}),
		columnHelper.accessor("succumbency", {
			header: "Sucumbência",
			cell: ({ getValue }) => formatter.currency(getValue()),
			meta: {
				headerClassName: "min-w-32 text-right",
				cellClassName: "whitespace-nowrap text-right",
			},
		}),
		columnHelper.accessor("entry", {
			header: "Entrada",
			cell: ({ getValue }) => formatter.currency(getValue()),
			meta: {
				headerClassName: "min-w-32 text-right",
				cellClassName: "whitespace-nowrap text-right font-semibold",
			},
		}),
		columnHelper.accessor("remuneration", {
			header: "Remuneração",
			cell: ({ getValue }) => formatter.currency(getValue()),
			meta: {
				headerClassName: "min-w-32 text-right",
				cellClassName: "whitespace-nowrap text-right",
			},
		}),
		columnHelper.accessor("expense", {
			header: "Despesa",
			cell: ({ getValue }) => formatter.currency(getValue()),
			meta: {
				headerClassName: "min-w-32 text-right",
				cellClassName: "whitespace-nowrap text-right",
			},
		}),
		columnHelper.accessor("output", {
			header: "Saída",
			cell: ({ getValue }) => formatter.currency(getValue()),
			meta: {
				headerClassName: "min-w-32 text-right",
				cellClassName: "whitespace-nowrap text-right font-semibold",
			},
		}),
		columnHelper.accessor("balance", {
			header: "Saldo",
			cell: ({ getValue }) => formatter.currency(getValue()),
			meta: {
				headerClassName: "min-w-32 text-right",
				cellClassName: "whitespace-nowrap text-right font-semibold",
			},
		}),
	];

	return (
		<Card className="hidden sm:block">
			<CardHeader>
				<CardTitle>Fluxo de caixa mensal</CardTitle>
			</CardHeader>
			<CardContent className="flex min-h-0 flex-1 flex-col pt-0">
				<DataTable
					columns={columns}
					data={rows}
					emptyMessage={EMPTY_LABEL}
					className="border-0"
				/>
			</CardContent>
		</Card>
	);
}
