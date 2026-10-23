import { DataTable } from "@/shared/components/data-table";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	// TableCell,
	// TableRow,
} from "@/shared/components/ui";
// import { formatter } from "@/shared/lib/formatter";
import type {
	DashboardRemunerationMonth,
	DashboardRemunerationRow,
	DashboardRemunerationSubtotal,
} from "../../schemas/model";
import { getColumns, type RemunerationTableSelectionOptions } from "./columns";

interface DashboardRemunerationTableProps
	extends RemunerationTableSelectionOptions {
	months: DashboardRemunerationMonth[];
	rows: DashboardRemunerationRow[];
	subtotal: DashboardRemunerationSubtotal | null;
}

const EMPTY_LABEL =
	"Nenhuma remuneração encontrada para os filtros selecionados.";

export function DashboardRemunerationTable({
	months,
	rows,
	onSelect,
}: DashboardRemunerationTableProps) {
	const columns = getColumns(months, onSelect);

	return (
		<Card className="hidden sm:block space-y-2">
			<CardHeader>
				<CardTitle>Remunerações</CardTitle>
			</CardHeader>
			<CardContent className="flex min-h-0 flex-1 flex-col pt-0">
				<DataTable
					columns={columns}
					data={rows}
					pageSize={10}
					emptyMessage={EMPTY_LABEL}
					// tableFooterContent={
					//   subtotal ? (
					//     <TableRow className="hover:bg-transparent">
					//       <TableCell className="whitespace-nowrap font-semibold">
					//         {subtotal.label}
					//       </TableCell>
					//       {months.map((month) => (
					//         <TableCell
					//           key={month.key}
					//           className="whitespace-nowrap text-right font-semibold"
					//         >
					//           {formatter.currency(subtotal.months[month.key] ?? 0)}
					//         </TableCell>
					//       ))}
					//       <TableCell className="whitespace-nowrap text-right font-semibold">
					//         {subtotal.formattedTotal}
					//       </TableCell>
					//     </TableRow>
					//   ) : null
					// }
					className="border-0"
				/>
			</CardContent>
		</Card>
	);
}
