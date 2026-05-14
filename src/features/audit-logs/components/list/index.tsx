import * as React from "react";
import { DataCardList } from "@/shared/components/data-card-list";
import type { DetailFieldItem } from "@/shared/components/entity-fields";
import { Pagination } from "@/shared/components/pagination";
import type { EntityId } from "@/shared/schemas/entity";
import type { QueryPaginatedReturnType } from "@/shared/types/api";
import type { AuditLog } from "../../schemas/model";

const AUDIT_ACTION_LABELS: Record<string, string> = {
	CREATE: "Criar",
	UPDATE: "Atualizar",
	DELETE: "Excluir",
	RESTORE: "Restaurar",
	GRANT_ACCESS: "Conceder acesso",
	REVOKE_ACCESS: "Revogar acesso",
	RESET_PASSWORD: "Redefinir senha",
};

function getAuditLogTitle(auditLog: AuditLog) {
	const actionLabel = AUDIT_ACTION_LABELS[auditLog.action] ?? auditLog.action;
	const entityLabel =
		auditLog.entityName || auditLog.entityTypeLabel || "Sistema";

	return `${actionLabel} • ${entityLabel}`;
}

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
			renderTitle={getAuditLogTitle}
			renderFields={renderCardFields}
			footerContent={<Pagination totalRecords={total} />}
		/>
	);
};
