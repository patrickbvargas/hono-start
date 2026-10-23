import { DataTable } from "@/shared/components/data-table";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui";
import type { DashboardCashFlowRow } from "../../schemas/model";
import { getColumns } from "./columns";

interface DashboardCashFlowTableProps {
	rows: DashboardCashFlowRow[];
}

const EMPTY_LABEL = "Nenhum dado de fluxo de caixa encontrado.";

export function DashboardCashFlowTable({ rows }: DashboardCashFlowTableProps) {
	const columns = getColumns();

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
