import { createColumnHelper } from "@tanstack/react-table";
import { getExpenseReadColumns } from "@/features/expenses";
import { formatter } from "@/shared/lib/formatter";
import type { dataTableFeatures } from "@/shared/lib/table";
import type {
	DashboardDrilldownRow,
	DashboardDrilldownSelection,
} from "../../schemas/drilldown";

const c = createColumnHelper<typeof dataTableFeatures, DashboardDrilldownRow>();

export function getDashboardDrilldownColumns(
	selection: DashboardDrilldownSelection,
) {
	const planned = selection.kind === "metric" && selection.value === "planned";
	const installment =
		selection.kind === "aging" || selection.kind === "forecast";
	const remuneration =
		selection.kind === "function" ||
		(selection.kind === "monthly" && selection.series === "remuneration") ||
		(selection.kind === "metric" && selection.value === "remuneration");
	const expense =
		selection.kind === "expense" ||
		(selection.kind === "monthly" && selection.series === "expense") ||
		(selection.kind === "metric" && selection.value === "expense");
	if (
		(selection.kind === "monthly" && selection.series === "result") ||
		(selection.kind === "metric" && selection.value === "result")
	) {
		return [
			c.accessor("date", {
				header: "Data",
				cell: ({ getValue }) => formatter.date(getValue()),
				enableSorting: true,
			}),
			c.accessor("kind", { header: "Movimento", enableSorting: true }),
			c.accessor(
				(row) => row.employee ?? row.client ?? row.category ?? row.description,
				{
					id: "reference",
					header: "Referência",
					enableSorting: true,
					meta: { cellClassName: "whitespace-normal max-w-64" },
				},
			),
			c.accessor("process", { header: "Processo", enableSorting: true }),
			c.accessor("amount", {
				header: "Valor",
				cell: ({ getValue }) => formatter.currency(getValue()),
				enableSorting: true,
				meta: { cellClassName: "whitespace-nowrap text-right" },
			}),
		];
	}
	if (expense) {
		const [category, date, amount] =
			getExpenseReadColumns<DashboardDrilldownRow>({
				category: (row) => row.category ?? "",
				date: (row) => row.date,
				amount: (row) => row.amount,
				enableSorting: true,
			});
		return [
			{ ...date, id: "date" },
			category,
			c.accessor("description", { header: "Descrição", enableSorting: true }),
			amount,
		];
	}
	return [
		c.accessor("date", {
			header: installment || planned ? "Vencimento" : "Data",
			cell: ({ getValue }) => formatter.date(getValue()),
			enableSorting: true,
		}),
		c.accessor("kind", { header: "Movimento", enableSorting: true }),
		...(remuneration
			? [
					c.accessor("employee", {
						header: "Colaborador",
						enableSorting: true,
					}),
					c.accessor("assignment", { header: "Função", enableSorting: true }),
				]
			: [
					c.accessor("client", { header: "Cliente", enableSorting: true }),
					c.accessor("description", {
						header: "Descrição",
						enableSorting: true,
					}),
				]),
		c.accessor("process", { header: "Processo", enableSorting: true }),
		...(!remuneration
			? [c.accessor("installment", { header: "Parcela", enableSorting: true })]
			: []),
		...(installment
			? [
					c.accessor("faceAmount", {
						header: "Valor da parcela",
						cell: ({ getValue }) => formatter.currency(getValue() ?? 0),
						enableSorting: true,
					}),
					c.accessor("paid", {
						header: "Pago",
						cell: ({ getValue }) => formatter.currency(getValue() ?? 0),
						enableSorting: true,
					}),
				]
			: []),
		c.accessor("amount", {
			header: installment ? "Em aberto" : "Valor",
			cell: ({ getValue }) => formatter.currency(getValue()),
			enableSorting: true,
			meta: { cellClassName: "whitespace-nowrap text-right" },
		}),
	];
}
