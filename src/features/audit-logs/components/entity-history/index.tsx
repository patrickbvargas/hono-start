import { createColumnHelper } from "@tanstack/react-table";
import {
	ChevronFirstIcon,
	ChevronLastIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from "lucide-react";
import { useMemo } from "react";
import { DataTable } from "@/shared/components/data-table";
import { PaginationView } from "@/shared/components/pagination";
import { TableButton } from "@/shared/components/table-button";
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
	const { auditLogs, isPending, error, retry, page, setPage, limit, details } =
		useEntityHistory(entityType, entityId);
	const columns = useMemo(() => {
		const c = createColumnHelper<typeof dataTableFeatures, AuditLog>();
		return [
			c.accessor("occurredAtLabel", {
				header: "Data e hora",
				enableSorting: false,
			}),
			c.accessor("action", {
				header: "Ação",
				enableSorting: false,
				cell: (context) =>
					AUDIT_ACTION_LABELS[context.getValue()] ?? context.getValue(),
			}),
			c.accessor("actorName", {
				header: "Responsável",
				enableSorting: false,
				cell: (context) => context.getValue() || "Sistema",
			}),
			c.accessor("description", {
				header: "Alteração",
				enableSorting: false,
				cell: (context) => (
					<TableButton
						type="button"
						onClick={() => details.open(context.row.original.id)}
						aria-label={`Ver alteração #${context.row.original.id}`}
					>
						{context.getValue() || "Ver detalhes"}
					</TableButton>
				),
			}),
		];
	}, [details.open]);
	if (isPending) {
		return (
			<div aria-label="Carregando histórico" className="space-y-3">
				{[1, 2, 3, 4].map((row) => (
					<Skeleton key={row} className="h-10 w-full" />
				))}
			</div>
		);
	}
	if (error) {
		return (
			<div role="alert" className="space-y-3">
				<p className="text-sm text-muted-foreground">
					Não foi possível carregar o histórico deste registro.
				</p>
				<Button variant="outline" onClick={() => void retry()}>
					Tentar novamente
				</Button>
			</div>
		);
	}
	const total = auditLogs?.total ?? 0;
	const pages = Math.max(1, Math.ceil(total / limit));
	return (
		<div className="space-y-3">
			<DataTable
				columns={columns}
				data={auditLogs?.data ?? []}
				emptyMessage="Nenhuma alteração registrada para este registro."
				className="max-h-[32rem]"
				footerContent={
					<PaginationView
						totalRecords={total}
						page={page}
						limit={limit}
						renderPage={(target, kind) => (
							<Button
								type="button"
								variant={
									target === page && kind === "number" ? "outline" : "ghost"
								}
								size="icon"
								aria-current={
									target === page && kind === "number" ? "page" : undefined
								}
								aria-label={
									kind === "number"
										? `Página ${target} do histórico`
										: {
												first: "Primeira página do histórico",
												previous: "Página anterior do histórico",
												next: "Próxima página do histórico",
												last: "Última página do histórico",
											}[kind]
								}
								disabled={
									kind === "first" || kind === "previous"
										? page <= 1
										: kind === "next" || kind === "last"
											? page >= pages
											: false
								}
								onClick={() => setPage(target)}
							>
								{
									{
										first: <ChevronFirstIcon />,
										previous: <ChevronLeftIcon />,
										next: <ChevronRightIcon />,
										last: <ChevronLastIcon />,
										number: String(target),
									}[kind]
								}
							</Button>
						)}
					/>
				}
			/>
			{details.render((id, state) => (
				<AuditLogDetails id={id} state={state} />
			))}
		</div>
	);
}
