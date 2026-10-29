import type { ReactNode } from "react";
import { useMemo } from "react";
import { DataTable } from "@/shared/components/data-table";
import { Pagination } from "@/shared/components/pagination";
import { useOverlay } from "@/shared/hooks/use-overlay";
import { usePendingWorkNavigation } from "../../hooks/use-navigation";
import type { PendingWorkPage } from "../../schemas/model";
import { PendingWorkContractSummary } from "../contract-summary";
import { PendingWorkRecordActions } from "../record-actions";
import { getPendingWorkTableColumns } from "./columns";

interface PendingWorkTableProps {
	emptyState?: ReactNode;
	data: PendingWorkPage;
}

export function PendingWorkTable({ data, emptyState }: PendingWorkTableProps) {
	const { openFinance } = usePendingWorkNavigation();
	const { overlay } = useOverlay<number>();
	const columns = useMemo(
		() => getPendingWorkTableColumns(overlay.details.open),
		[overlay.details.open],
	);
	return (
		<>
			<DataTable
				emptyState={emptyState}
				className="min-h-0 flex-1"
				columns={columns}
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
