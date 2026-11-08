import { createColumnHelper } from "@tanstack/react-table";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import type { dataTableFeatures } from "@/shared/lib/table";
import type {
	FinancialDrilldownRow,
	FinancialDrilldownSelection,
} from "../../schemas/drilldown";

const c = createColumnHelper<typeof dataTableFeatures, FinancialDrilldownRow>();

export function getFinancialDrilldownColumns(
	selection: FinancialDrilldownSelection,
) {
	const isOpenTitles =
		selection.kind === "aging" ||
		selection.kind === "forecast" ||
		(selection.kind === "metric" &&
			(selection.value === "receivables" || selection.value === "payables")) ||
		(selection.kind === "monthly" &&
			(selection.series === "entryProjected" ||
				selection.series === "outputProjected"));

	const isBalance =
		(selection.kind === "metric" &&
			(selection.value === "realized_balance" ||
				selection.value === "projected_balance")) ||
		(selection.kind === "monthly" &&
			(selection.series === "balanceRealized" ||
				selection.series === "balanceTotal"));

	if (isBalance) {
		return [
			c.accessor("date", {
				header: "Data / Vencimento",
				cell: ({ getValue }) => formatter.calendarDate(getValue()),
				enableSorting: true,
			}),
			c.accessor("kind", { header: "Movimento", enableSorting: true }),
			c.accessor((row) => row.employee ?? row.client ?? row.description, {
				id: "reference",
				header: "Referência / Favorecido",
				enableSorting: true,
				meta: { cellClassName: "whitespace-normal max-w-64" },
			}),
			c.accessor("category", { header: "Analítica", enableSorting: true }),
			c.accessor("process", { header: "Processo", enableSorting: true }),
			c.accessor("amount", {
				header: "Valor",
				cell: ({ getValue }) => (
					<SensitiveValue>{formatter.currency(getValue())}</SensitiveValue>
				),
				enableSorting: true,
				meta: { cellClassName: "whitespace-nowrap text-right" },
			}),
		];
	}

	return [
		c.accessor("date", {
			header: isOpenTitles ? "Vencimento" : "Data",
			cell: ({ getValue }) => formatter.calendarDate(getValue()),
			enableSorting: true,
		}),
		c.accessor("kind", { header: "Movimento", enableSorting: true }),
		c.accessor((row) => row.employee ?? row.client ?? row.description, {
			id: "reference",
			header: "Referência / Favorecido",
			enableSorting: true,
			meta: { cellClassName: "whitespace-normal max-w-64" },
		}),
		c.accessor("category", { header: "Analítica", enableSorting: true }),
		c.accessor("type", { header: "Tipo", enableSorting: true }),
		c.accessor("process", { header: "Processo", enableSorting: true }),
		...(isOpenTitles
			? [
					c.accessor("faceAmount", {
						header: "Valor original",
						cell: ({ getValue }) => (
							<SensitiveValue>
								{formatter.currency(getValue() ?? 0)}
							</SensitiveValue>
						),
						enableSorting: true,
					}),
					c.accessor("paid", {
						header: "Pago / Baixado",
						cell: ({ getValue }) => (
							<SensitiveValue>
								{formatter.currency(getValue() ?? 0)}
							</SensitiveValue>
						),
						enableSorting: true,
					}),
				]
			: []),
		c.accessor("amount", {
			header: isOpenTitles ? "Em aberto" : "Valor",
			cell: ({ getValue }) => (
				<SensitiveValue>{formatter.currency(getValue())}</SensitiveValue>
			),
			enableSorting: true,
			meta: { cellClassName: "whitespace-nowrap text-right" },
		}),
	];
}
