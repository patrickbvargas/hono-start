import { createColumnHelper } from "@tanstack/react-table";
import { TableButton } from "@/shared/components/table-button";
import { formatter } from "@/shared/lib/formatter";
import type { dataTableFeatures } from "@/shared/lib/table";
import type {
	DashboardRemunerationMonth,
	DashboardRemunerationRow,
} from "../../schemas/model";

export interface RemunerationTableSelectionOptions {
	onViewEmployee?: (id: number) => void;
	onSelect?: (
		row: DashboardRemunerationRow,
		month: DashboardRemunerationMonth | undefined,
		trigger: HTMLElement,
	) => void;
}

export function getColumns(
	months: DashboardRemunerationMonth[],
	onSelect?: RemunerationTableSelectionOptions["onSelect"],
	onViewEmployee?: RemunerationTableSelectionOptions["onViewEmployee"],
) {
	const columnHelper = createColumnHelper<
		typeof dataTableFeatures,
		DashboardRemunerationRow
	>();
	return [
		columnHelper.accessor("employeeName", {
			id: "employeeName",
			header: "Colaborador",
			cell: (context) =>
				onViewEmployee ? (
					<TableButton
						type="button"
						aria-label={`Detalhar colaborador ${context.getValue()}`}
						title={`Ver detalhes: ${context.getValue()}`}
						onClick={() => onViewEmployee(context.row.original.employeeId)}
					>
						{context.getValue()}
					</TableButton>
				) : (
					context.getValue()
				),
			meta: {
				headerClassName: "min-w-40",
				cellClassName: "whitespace-nowrap font-medium",
			},
		}),
		...months.map((month) =>
			columnHelper.accessor((row) => row.months[month.key] ?? 0, {
				id: month.key,
				header: month.label,
				cell: (context) =>
					onSelect ? (
						<TableButton
							type="button"
							aria-label={`Detalhar remunerações de ${context.row.original.employeeName} em ${month.label}`}
							title={`Ver detalhes: ${context.row.original.employeeName} · ${month.label}`}
							onClick={(event) =>
								onSelect(context.row.original, month, event.currentTarget)
							}
						>
							{formatter.currency(context.getValue())}
						</TableButton>
					) : (
						formatter.currency(context.getValue())
					),
				meta: {
					headerClassName: "min-w-32 text-right",
					cellClassName: "whitespace-nowrap text-right",
				},
			}),
		),
		columnHelper.accessor("total", {
			id: "total",
			header: "Valor total no período",
			cell: (context) =>
				onSelect ? (
					<TableButton
						type="button"
						aria-label={`Detalhar total de remunerações de ${context.row.original.employeeName}`}
						title={`Ver detalhes: ${context.row.original.employeeName} · Total no período`}
						onClick={(event) =>
							onSelect(context.row.original, undefined, event.currentTarget)
						}
					>
						{formatter.currency(context.getValue())}
					</TableButton>
				) : (
					formatter.currency(context.getValue())
				),
			meta: {
				headerClassName: "min-w-40 text-right",
				cellClassName: "whitespace-nowrap text-right font-semibold",
			},
		}),
	];
}
