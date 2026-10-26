import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTable } from "@/shared/components/data-table";
import { Pagination } from "@/shared/components/pagination";
import { formatter } from "@/shared/lib/formatter";
import type { dataTableFeatures } from "@/shared/lib/table";
import { usePendingWorkNavigation } from "../../hooks/use-navigation";
import type { PendingWork, PendingWorkPage } from "../../schemas/model";
import { PendingWorkDueDate } from "../due-date";
import { PendingWorkSeverity } from "../severity";

interface PendingWorkTableProps {
	data: PendingWorkPage;
}

export function PendingWorkTable({ data }: PendingWorkTableProps) {
	const { openFinance } = usePendingWorkNavigation();
	const columns = useMemo(() => {
		const c = createColumnHelper<typeof dataTableFeatures, PendingWork>();
		return [
			c.accessor("severity", {
				header: "Criticidade",
				enableSorting: true,
				cell: ({ getValue }) => <PendingWorkSeverity severity={getValue()} />,
			}),
			c.accessor("title", {
				header: "Pendência",
				enableSorting: true,
				meta: { cellClassName: "max-w-56 whitespace-normal" },
			}),
			c.accessor("processNumber", {
				header: "Contrato",
				enableSorting: true,
			}),
			c.accessor("client", {
				header: "Cliente",
				meta: { cellClassName: "max-w-48 whitespace-normal" },
				enableSorting: true,
			}),
			c.accessor("dueDate", {
				header: "Vencimento",
				enableSorting: true,
				cell: ({ row }) => (
					<PendingWorkDueDate
						date={row.original.dueDate}
						overdueDays={row.original.overdueDays}
					/>
				),
			}),
			c.accessor("remainingAmount", {
				header: "Saldo a receber",
				enableSorting: true,
				cell: ({ getValue }) => {
					const value = getValue();
					return value === null ? "—" : formatter.currency(value);
				},
				meta: { cellClassName: "whitespace-nowrap tabular-nums" },
			}),
		];
	}, []);
	return (
		<DataTable
			className="min-h-0 flex-1"
			columns={columns}
			data={data.data}
			onRowAction={(index) => openFinance(data.data[index].contractId)}
			getRowId={(item) => item.id}
			emptyMessage="Nenhuma pendência encontrada para os filtros selecionados."
			footerContent={<Pagination totalRecords={data.total} />}
		/>
	);
}
