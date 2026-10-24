import { DataTable } from "@/shared/components/data-table";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui";
import type { DashboardOverdueInstallmentRow } from "../../schemas/model";
import { getColumns } from "./columns";

interface DashboardOverdueInstallmentsTableProps {
	rows: DashboardOverdueInstallmentRow[];
	onViewContract?: (id: number) => void;
}

const EMPTY_LABEL =
	"Nenhuma parcela em atraso encontrada para os filtros selecionados.";

export function DashboardOverdueInstallmentsTable({
	rows,
	onViewContract,
}: DashboardOverdueInstallmentsTableProps) {
	const columns = getColumns(onViewContract);

	return (
		<Card className="hidden sm:block space-y-2">
			<CardHeader>
				<CardTitle>Parcelas em atraso</CardTitle>
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
