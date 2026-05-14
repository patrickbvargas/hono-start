import * as React from "react";
import { DataCardList } from "@/shared/components/data-card-list";
import type { DetailFieldItem } from "@/shared/components/entity-fields";
import { Pagination } from "@/shared/components/pagination";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import type { AuditLog } from "../../schemas/model";

interface AuditLogListProps {
	data: QueryPaginatedReturnType<AuditLog>;
	onView?: (id: EntityId) => void;
}

export const AuditLogList = ({ data, onView }: AuditLogListProps) => {
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
			data={items}
			getRowKey={(auditLog) => auditLog.id}
			onCardAction={onView ? (auditLog) => onView(auditLog.id) : undefined}
			renderTitle={(auditLog) =>
				auditLog.entityName ||
				auditLog.entityTypeLabel ||
				(!auditLog.actorName ? "Sistema" : "—")
			}
			renderDescription={(auditLog) =>
				auditLog.action || (!auditLog.actorName ? "Sistema" : "—")
			}
			renderFields={renderCardFields}
			footerContent={<Pagination totalRecords={total} />}
		/>
	);
};
