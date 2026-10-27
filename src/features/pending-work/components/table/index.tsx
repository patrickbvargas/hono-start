import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTable } from "@/shared/components/data-table";
import { Pagination } from "@/shared/components/pagination";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { useOverlay } from "@/shared/hooks/use-overlay";
import { formatter } from "@/shared/lib/formatter";
import type { dataTableFeatures } from "@/shared/lib/table";
import { usePendingWorkNavigation } from "../../hooks/use-navigation";
import type { PendingWork, PendingWorkPage } from "../../schemas/model";
import { PendingWorkContractSummary } from "../contract-summary";
import { PendingWorkDueDate } from "../due-date";
import { PendingWorkRecordActions } from "../record-actions";
import { PendingWorkSeverity } from "../severity";

interface PendingWorkTableProps {
	data: PendingWorkPage;
}

export function PendingWorkTable({ data }: PendingWorkTableProps) {
	const { openFinance } = usePendingWorkNavigation();
	const { overlay } = useOverlay<number>();
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
					return value === null ? (
						"—"
					) : (
						<SensitiveValue>{formatter.currency(value)}</SensitiveValue>
					);
				},
				meta: { cellClassName: "whitespace-nowrap tabular-nums" },
			}),
		];
	}, []);
	return (
		<>
			<DataTable
				className="min-h-0 flex-1"
				columns={[
					...columns,
					{
						id: "actions",
						header: "",
						enableSorting: false,
						meta: { headerClassName: "w-10", cellClassName: "text-right" },
						cell: ({ row }) => (
							<PendingWorkRecordActions
								item={row.original}
								onView={overlay.details.open}
							/>
						),
					},
				]}
				data={data.data}
				onRowAction={(index) => openFinance(data.data[index].contractId)}
				renderRowContextMenu={(index) => (
					<PendingWorkRecordActions
						item={data.data[index]}
						presentation="context"
						onView={overlay.details.open}
					/>
				)}
				getRowId={(item) => item.id}
				emptyMessage="Nenhuma pendência encontrada para os filtros selecionados."
				footerContent={<Pagination totalRecords={data.total} />}
			/>
			{overlay.details.render((id, state) => (
				<PendingWorkContractSummary id={id} state={state} />
			))}
		</>
	);
}
