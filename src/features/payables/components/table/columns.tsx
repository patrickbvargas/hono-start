import { createColumnHelper } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { EntityIdTrigger } from "@/shared/components/entity-id-trigger";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import type { dataTableFeatures } from "@/shared/lib/table";
import { PAYABLE_KINDS, PAYABLE_ORIGINS } from "../../constants/values";
import type { PayableSummary } from "../../schemas/model";
import { PayableStatus } from "../status";
export function getPayableTableColumns(
	renderActions: (row: PayableSummary) => ReactNode,
) {
	const c = createColumnHelper<typeof dataTableFeatures, PayableSummary>();
	return [
		c.accessor("id", {
			header: "#",
			enableSorting: false,
			cell: ({ row }) => <EntityIdTrigger id={row.original.id} />,
		}),
		c.accessor("beneficiaryName", {
			header: "Beneficiário",
			enableSorting: true,
		}),
		c.accessor("origin", {
			header: "Origem",
			enableSorting: false,
			cell: ({ row }) =>
				PAYABLE_ORIGINS.find((item) => item.value === row.original.origin)
					?.label,
		}),
		c.accessor("kind", {
			header: "Classificação",
			enableSorting: false,
			cell: (context) =>
				PAYABLE_KINDS.find((item) => item.value === context.getValue())?.label,
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
			cell: ({ row }) => <PayableStatus payable={row.original} />,
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
