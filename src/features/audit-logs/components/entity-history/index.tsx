import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTable } from "@/shared/components/data-table";
import { EntityActions } from "@/shared/components/entity-actions";
import { Button, Skeleton } from "@/shared/components/ui";
import type { dataTableFeatures } from "@/shared/lib/table";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import { AUDIT_ACTION_LABELS } from "../../constants/display";
import { useEntityHistory } from "../../hooks/use-entity-history";
import type { AuditLog } from "../../schemas/model";
import { AuditLogDetails } from "../details";

interface EntityAuditHistoryProps {
	entityType: string;
	entityId: number;
}
export function EntityAuditHistory(props: EntityAuditHistoryProps) {
	const session = useLoggedUserSession();
	if (!hasPermission(session, "org:audit_logs:read")) {
		return (
			<p className="text-sm text-muted-foreground">
				A consulta à auditoria está disponível para os perfis autorizados.
			</p>
		);
	}
	return (
		<EntityAuditHistoryContent
			key={`${props.entityType}:${props.entityId}`}
			{...props}
		/>
	);
}
function EntityAuditHistoryContent({
	entityType,
	entityId,
}: EntityAuditHistoryProps) {
	const { auditLogs, isPending, error, retry, details, openPage } =
		useEntityHistory(entityType, entityId);
	const columns = useMemo(() => {
		const c = createColumnHelper<typeof dataTableFeatures, AuditLog>();
		return [
			c.accessor("id", {
				header: "#",
				enableSorting: false,
				cell: ({ row }) => (
					<span className="font-mono text-muted-foreground">
						#{row.original.id}
					</span>
				),
				meta: { headerClassName: "w-18", cellClassName: "whitespace-nowrap" },
			}),
			c.accessor("occurredAtLabel", {
				header: "Ocorrido em",
				enableSorting: false,
			}),
			c.accessor("action", {
				header: "Ação",
				enableSorting: false,
				cell: (context) =>
					AUDIT_ACTION_LABELS[context.getValue()] ?? context.getValue(),
			}),
			c.accessor("actorName", {
				header: "Usuário",
				enableSorting: false,
				cell: (context) => context.getValue() || "Sistema",
			}),
			c.accessor("description", {
				header: "Detalhes",
				enableSorting: false,
				cell: (context) => context.getValue() || "Ver resumo",
			}),
		];
	}, []);
	if (isPending) {
		return (
			<div aria-label="Carregando histórico">
				<Skeleton className="h-20 w-full" />
			</div>
		);
	}
	if (error) {
		return (
			<div role="alert" className="space-y-3">
				<p className="text-sm text-muted-foreground">
					Não foi possível carregar o histórico deste registro.
				</p>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => void retry()}
				>
					Tentar novamente
				</Button>
			</div>
		);
	}
	const data = auditLogs ?? [];
	return (
		<div className="space-y-3">
			<DataTable
				columns={columns}
				data={data}
				onRowAction={(index) => details.open(data[index].id)}
				rowActionLabel="Ver resumo da alteração"
				renderRowContextMenu={(index) => (
					<EntityActions
						presentation="context"
						viewPermission="org:audit_logs:read"
						onOpenPage={() => openPage(data[index].id)}
						onView={() => details.open(data[index].id)}
					/>
				)}
				emptyMessage="Nenhuma alteração registrada para este registro."
				className="max-h-[32rem] rounded-none border-0"
				pageSize={25}
			/>
			{details.render((id, state) => (
				<AuditLogDetails id={id} state={state} />
			))}
		</div>
	);
}
