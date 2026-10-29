import * as React from "react";
import { DataTable } from "@/shared/components/data-table";
import { EntityActions } from "@/shared/components/entity-actions";
import { Pagination } from "@/shared/components/pagination";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import type { AuditLog } from "../../schemas/model";

import { getAuditLogTableColumns } from "./columns";

interface AuditLogTableProps {
	emptyState?: React.ReactNode;
	data: QueryPaginatedReturnType<AuditLog>;
	onOpenPage?: (id: EntityId) => void;
	onView?: (id: EntityId) => void;
}

export const AuditLogTable = ({
	emptyState,
	data: { data, total },
	onOpenPage,
	onView,
}: AuditLogTableProps) => {
	const renderActions = React.useCallback(
		(auditLog: AuditLog, presentation: "dropdown" | "context" = "dropdown") => {
			return (
				<EntityActions
					presentation={presentation}
					viewPermission="org:audit_logs:read"
					onOpenPage={onOpenPage ? () => onOpenPage(auditLog.id) : undefined}
					onView={onView ? () => onView(auditLog.id) : undefined}
				/>
			);
		},
		[onView, onOpenPage],
	);

	const columns = React.useMemo(
		() => getAuditLogTableColumns(renderActions, Boolean(onOpenPage ?? onView)),
		[renderActions, onOpenPage, onView],
	);

	return (
		<DataTable
			emptyState={emptyState}
			columns={columns}
			data={data}
			renderRowContextMenu={(index) => renderActions(data[index], "context")}
			onRowAction={
				onOpenPage ? (index) => onOpenPage(data[index].id) : undefined
			}
			footerContent={<Pagination totalRecords={total} />}
		/>
	);
};
