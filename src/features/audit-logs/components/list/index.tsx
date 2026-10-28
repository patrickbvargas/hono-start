import * as React from "react";
import { DataCardList } from "@/shared/components/data-card-list";
import { EntityActions } from "@/shared/components/entity-actions";
import type { DetailFieldItem } from "@/shared/components/entity-fields";
import { Pagination } from "@/shared/components/pagination";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import type { AuditLog } from "../../schemas/model";
import { getAuditLogTitle } from "../../utils/display";

interface AuditLogListProps {
	emptyState?: React.ReactNode;
	data: QueryPaginatedReturnType<AuditLog>;
	onOpenPage?: (id: EntityId) => void;
	onView?: (id: EntityId) => void;
}

export const AuditLogList = ({
	emptyState,
	data,
	onView,
	onOpenPage,
}: AuditLogListProps) => {
	const { data: items, total } = data;

	const renderCardFields = React.useCallback(
		(auditLog: AuditLog): DetailFieldItem[] => {
			const isSystemEvent =
				!auditLog.entityName &&
				!auditLog.entityTypeLabel &&
				!auditLog.actorName;
			const isTypeUsedAsTitle =
				!auditLog.entityName && Boolean(auditLog.entityTypeLabel);

			return [
				{
					term: "Ocorrido em",
					definition: auditLog.occurredAtLabel || "—",
				},
				...(!isSystemEvent
					? [
							{
								term: "Usuário",
								definition: auditLog.actorName || "Sistema",
							},
						]
					: []),
				...(!isTypeUsedAsTitle
					? [
							{
								term: "Tipo",
								definition:
									auditLog.entityTypeLabel || (isSystemEvent ? "Sistema" : "—"),
							},
						]
					: []),
				{
					term: "Detalhes",
					definition: auditLog.description || "—",
					classNames: auditLog.description
						? {
								item: "col-span-2",
							}
						: undefined,
				},
				{
					term: "Endereço IP",
					definition: auditLog.ipAddress ?? "—",
				},
			];
		},
		[],
	);

	return (
		<DataCardList
			emptyState={emptyState}
			data={items}
			getRowKey={(auditLog) => auditLog.id}
			onCardAction={
				(onOpenPage ?? onView)
					? (auditLog) => (onOpenPage ?? onView)?.(auditLog.id)
					: undefined
			}
			renderActions={(auditLog) => (
				<EntityActions
					viewPermission="org:audit_logs:read"
					onOpenPage={onOpenPage ? () => onOpenPage(auditLog.id) : undefined}
					onView={onView ? () => onView(auditLog.id) : undefined}
				/>
			)}
			renderTitle={getAuditLogTitle}
			renderFields={renderCardFields}
			footerContent={<Pagination totalRecords={total} />}
		/>
	);
};
