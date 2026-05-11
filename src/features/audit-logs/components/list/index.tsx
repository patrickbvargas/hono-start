import * as React from "react";
import { DataCardList } from "@/shared/components/data-card-list";
import type { DetailFieldItem } from "@/shared/components/entity-fields";
import { Pagination } from "@/shared/components/pagination";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import type { AuditLog } from "../../schemas/model";

interface AuditLogListProps {
	data: QueryPaginatedReturnType<AuditLog>;
}

export const AuditLogList = ({ data }: AuditLogListProps) => {
	const { data: items, total } = data;

	const renderCardFields = React.useCallback(
		(auditLog: AuditLog): DetailFieldItem[] => [
			{
				term: "Data",
				definition: auditLog.occurredAtLabel,
			},
			{
				term: "Usuário",
				definition: auditLog.actorName,
			},
			{
				term: "Ação",
				definition: auditLog.action,
			},
			{
				term: "Tipo",
				definition: auditLog.entityTypeLabel,
			},
			{
				term: "Registro",
				definition: auditLog.entityName,
			},
			{
				term: "IP",
				definition: auditLog.ipAddress ?? "-",
			},
			{
				term: "Descrição",
				definition: auditLog.description,
				classNames: {
					item: "col-span-2",
				},
			},
		],
		[],
	);

	return (
		<DataCardList
			data={items}
			getRowKey={(auditLog) => auditLog.id}
			renderTitle={(auditLog) => `#${auditLog.id}`}
			renderDescription={(auditLog) => auditLog.entityTypeLabel}
			renderFields={renderCardFields}
			footerContent={<Pagination totalRecords={total} />}
		/>
	);
};
