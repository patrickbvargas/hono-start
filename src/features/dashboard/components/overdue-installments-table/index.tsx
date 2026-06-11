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

interface DashboardOverdueInstallmentsTableProps {
	rows: DashboardSummary["overdueInstallments"];
}

const EMPTY_LABEL =
	"Nenhuma parcela em possível inadimplência encontrada para os filtros selecionados.";

export function DashboardOverdueInstallmentsTable({
	rows,
}: DashboardOverdueInstallmentsTableProps) {
	const columnHelper =
		createColumnHelper<DashboardSummary["overdueInstallments"][number]>();
	const columns = [
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
			cell: ({ getValue }) => formatter.date(getValue()),
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

	return (
		<Card className="hidden sm:block">
			<CardHeader>
				<CardTitle>Parcelas em possível inadimplência</CardTitle>
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
