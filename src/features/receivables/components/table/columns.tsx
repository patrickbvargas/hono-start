import { createColumnHelper } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { EntityIdTrigger } from "@/shared/components/entity-id-trigger";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import type { dataTableFeatures } from "@/shared/lib/table";
import { RECEIVABLE_KINDS } from "../../constants/values";
import type { ReceivableSummary } from "../../schemas/model";
import { ReceivableStatus } from "../status";
export function getReceivableTableColumns(
	renderActions: (row: ReceivableSummary) => ReactNode,
) {
	const c = createColumnHelper<typeof dataTableFeatures, ReceivableSummary>();
	return [
		c.accessor("id", {
			header: "#",
			enableSorting: false,
			cell: ({ row }) => <EntityIdTrigger id={row.original.id} />,
		}),
		c.accessor("debtorName", { header: "Devedor", enableSorting: true }),
		c.accessor("processNumber", {
			header: "Origem",
			enableSorting: false,
			cell: ({ row }) =>
				row.original.contractId
					? row.original.processNumber || `Contrato #${row.original.contractId}`
					: "Sem vínculo com contrato",
		}),
		c.accessor("kind", {
			header: "Classificação",
			enableSorting: false,
			cell: (context) =>
				RECEIVABLE_KINDS.find((item) => item.value === context.getValue())
					?.label,
		}),
		c.accessor("dueDate", {
			header: "Vencimento",
			enableSorting: true,
			cell: (context) => formatter.calendarDate(context.getValue()),
		}),
		c.display({
			id: "situation",
			header: "Situação",
			enableSorting: false,
			cell: ({ row }) => <ReceivableStatus receivable={row.original} />,
		}),
		...(
			[
				["principalAbated", "Principal abatido"],
				["balance", "Saldo"],
				["amount", "Valor nominal"],
			] as const
		).map(([key, header]) =>
			c.accessor(key, {
				header,
				enableSorting: key === "amount",
				cell: (context) => (
					<SensitiveValue>
						{formatter.currency(context.getValue())}
					</SensitiveValue>
				),
				meta: { cellClassName: "text-right whitespace-nowrap" },
			}),
		),
		c.display({
			id: "actions",
			header: "",
			enableSorting: false,
			cell: ({ row }) => renderActions(row.original),
			meta: { cellClassName: "text-right", headerClassName: "w-12" },
		}),
	];
}
