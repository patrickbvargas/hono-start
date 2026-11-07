import { type ReactNode, useCallback, useMemo } from "react";
import { DataTable } from "@/shared/components/data-table";
import { EntityActions } from "@/shared/components/entity-actions";
import { Pagination } from "@/shared/components/pagination";
import { PAYABLE_READ_PERMISSIONS } from "../../constants/values";
import type { PayablePage, PayableSummary } from "../../schemas/model";
import { getPayableTableColumns } from "./columns";

interface PayableTableProps {
	data: PayablePage;
	emptyState?: ReactNode;
	onOpenPage: (id: number) => void;
	onView: (id: number) => void;
}
export function PayableTable({
	data,
	emptyState,
	onOpenPage,
	onView,
}: PayableTableProps) {
	const renderActions = useCallback(
		(
			row: PayableSummary,
			presentation: "dropdown" | "context" = "dropdown",
		) => (
			<EntityActions
				presentation={presentation}
				viewPermission={PAYABLE_READ_PERMISSIONS}
				onOpenPage={() => onOpenPage(row.id)}
				onView={() => onView(row.id)}
			/>
		),
		[onOpenPage, onView],
	);
	const columns = useMemo(
		() => getPayableTableColumns(renderActions),
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
