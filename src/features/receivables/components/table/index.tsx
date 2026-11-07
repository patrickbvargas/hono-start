import { type ReactNode, useCallback, useMemo } from "react";
import { DataTable } from "@/shared/components/data-table";
import { EntityActions } from "@/shared/components/entity-actions";
import { Pagination } from "@/shared/components/pagination";
import { RECEIVABLE_READ_PERMISSIONS } from "../../constants/values";
import type { ReceivablePage, ReceivableSummary } from "../../schemas/model";
import { getReceivableTableColumns } from "./columns";

interface ReceivableTableProps {
	data: ReceivablePage;
	emptyState?: ReactNode;
	onOpenPage: (id: number) => void;
	onView: (id: number) => void;
}
export function ReceivableTable({
	data,
	emptyState,
	onOpenPage,
	onView,
}: ReceivableTableProps) {
	const renderActions = useCallback(
		(
			row: ReceivableSummary,
			presentation: "dropdown" | "context" = "dropdown",
		) => (
			<EntityActions
				presentation={presentation}
				viewPermission={RECEIVABLE_READ_PERMISSIONS}
				onOpenPage={() => onOpenPage(row.id)}
				onView={() => onView(row.id)}
			/>
		),
		[onOpenPage, onView],
	);
	const columns = useMemo(
		() => getReceivableTableColumns(renderActions),
		[renderActions],
	);
	return (
		<DataTable
			data={data.data}
			columns={columns}
			emptyState={emptyState}
			onRowAction={(index) => onOpenPage(data.data[index].id)}
			renderRowContextMenu={(index) =>
				renderActions(data.data[index], "context")
			}
			footerContent={<Pagination totalRecords={data.total} />}
		/>
	);
}
