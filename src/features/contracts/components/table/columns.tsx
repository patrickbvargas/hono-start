import { createColumnHelper } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { EntityIdTrigger } from "@/shared/components/entity-id-trigger";
import { formatter } from "@/shared/lib/formatter";
import type { dataTableFeatures } from "@/shared/lib/table";
import { CONTRACT_ALLOWED_SORT_COLUMNS } from "../../constants/sorting";
import type { ContractSummary } from "../../schemas/model";

export function getContractTableColumns(
	renderActions: (row: ContractSummary) => ReactNode,
) {
	const c = createColumnHelper<typeof dataTableFeatures, ContractSummary>();

	return [
		c.accessor("id", {
			header: "#",
			cell: ({ row }) => (
				<EntityIdTrigger
					id={row.original.id}
					actionLabel={`Abrir página do contrato #${row.original.id}`}
				/>
			),
			enableSorting: CONTRACT_ALLOWED_SORT_COLUMNS.includes("id"),
			meta: {
				headerClassName: "w-18",
				cellClassName: "whitespace-nowrap",
			},
		}),
		c.accessor("processNumber", {
			cell: (context) => (
				<EntityIdTrigger
					id={context.row.original.id}
					label={context.getValue()}
				/>
			),
			header: "Processo",
			enableSorting: CONTRACT_ALLOWED_SORT_COLUMNS.includes("processNumber"),
			meta: {
				minColumnWidth: 200,
			},
		}),
		c.accessor("client", {
			header: "Cliente",
			enableSorting: CONTRACT_ALLOWED_SORT_COLUMNS.includes("client"),
			meta: {
				minColumnWidth: 240,
			},
		}),
		c.accessor("lawyer", {
			header: "Advogado",
			meta: {
				minColumnWidth: 240,
			},
		}),
		c.accessor("legalArea", {
			header: "Área",
			enableSorting: CONTRACT_ALLOWED_SORT_COLUMNS.includes("legalArea"),
		}),
		c.accessor("status", {
			header: "Andamento",
			enableSorting: CONTRACT_ALLOWED_SORT_COLUMNS.includes("status"),
		}),
		c.accessor("feePercentage", {
			header: "Honorários (%)",
			cell: ({ row }) => formatter.percent(row.original.feePercentage),
			enableSorting: CONTRACT_ALLOWED_SORT_COLUMNS.includes("feePercentage"),
		}),
		c.display({
			id: "actions",
			cell: ({ row }) => renderActions(row.original),
			meta: {
				cellClassName: "w-11",
			},
		}),
	];
}
