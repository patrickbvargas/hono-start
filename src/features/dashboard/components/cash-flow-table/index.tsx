import { DataTable } from "@/shared/components/data-table";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui";
import type { DashboardCashFlowRow } from "../../schemas/model";
import { type CashFlowSelectionOptions, getColumns } from "./columns";

interface DashboardCashFlowTableProps extends CashFlowSelectionOptions {
	rows: DashboardCashFlowRow[];
}

const EMPTY_LABEL = "Nenhum dado de saldo encontrado.";

export function DashboardCashFlowTable({
	rows,
	onSelect,
}: DashboardCashFlowTableProps) {
	const columns = getColumns(onSelect);

	return (
		<Card className="hidden sm:block space-y-2">
			<CardHeader>
				<CardTitle>Saldo mensal</CardTitle>
			</CardHeader>
			<CardContent className="flex min-h-0 flex-1 flex-col pt-0">
				<DataTable
					columns={columns}
					data={rows}
					pageSize={10}
					emptyMessage={EMPTY_LABEL}
					className="border-0"
				/>
			</CardContent>
		</Card>
	);
}
