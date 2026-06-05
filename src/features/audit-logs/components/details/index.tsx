import * as React from "react";
import {
	type DetailFieldItem,
	EntityDetail,
} from "@/shared/components/entity-detail";
import { Skeleton } from "@/shared/components/ui";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useAuditLog } from "../../hooks/use-data";
import {
	type AuditChangeDiffEntry,
	type AuditChangeValueEntry,
	buildAuditChangePresentation,
} from "../../utils/change-details";

const AUDIT_ACTION_LABELS: Record<string, string> = {
	CREATE: "Criar",
	UPDATE: "Atualizar",
	DELETE: "Excluir",
	RESTORE: "Restaurar",
	GRANT_ACCESS: "Conceder acesso",
	RESTORE_ACCESS: "Restaurar acesso",
	REVOKE_ACCESS: "Revogar acesso",
	RESET_PASSWORD: "Redefinir senha",
};

function getAuditLogTitle(params: {
	action: string;
	entityName: string;
	entityTypeLabel: string;
}) {
	const actionLabel = AUDIT_ACTION_LABELS[params.action] ?? params.action;
	const entityLabel = params.entityName || params.entityTypeLabel || "Sistema";

	return `${actionLabel} • ${entityLabel}`;
}

interface AuditLogDetailsProps {
	id: EntityId;
	state: OverlayState;
}

export const AuditLogDetails = ({ id, state }: AuditLogDetailsProps) => {
	return (
		<EntityDetail.Root key={id} state={state}>
			<React.Suspense fallback={<AuditLogDetailsFallback />}>
				<AuditLogDetailsContent id={id} />
			</React.Suspense>
		</EntityDetail.Root>
	);
};

interface AuditLogDetailsContentProps {
	id: EntityId;
}

const AuditLogDetailsContent = ({ id }: AuditLogDetailsContentProps) => {
	const { auditLog } = useAuditLog(id);
	const changePresentation = React.useMemo(
		() =>
			buildAuditChangePresentation({
				action: auditLog.action,
				changeData: auditLog.changeData,
			}),
		[auditLog.action, auditLog.changeData],
	);

	const summaryInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "Ação", definition: auditLog.action || "—" },
			{ term: "Tipo", definition: auditLog.entityTypeLabel || "Sistema" },
			{ term: "Entidade", definition: auditLog.entityName || "Sistema" },
			{ term: "ID da entidade", definition: auditLog.entityId ?? "—" },
			{ term: "Usuário", definition: auditLog.actorName || "Sistema" },
			{ term: "E-mail", definition: auditLog.actorEmail ?? "—" },
			{ term: "Ocorrido em", definition: auditLog.occurredAtLabel },
			{ term: "Endereço IP", definition: auditLog.ipAddress ?? "—" },
			{ term: "Navegador", definition: auditLog.userAgent ?? "—" },
			{ term: "Resumo", definition: auditLog.description || "—" },
		],
		[auditLog],
	);

	return (
		<EntityDetail.Content>
			<EntityDetail.Header>
				<EntityDetail.Title>
					{getAuditLogTitle({
						action: auditLog.action,
						entityName: auditLog.entityName,
						entityTypeLabel: auditLog.entityTypeLabel,
					})}
				</EntityDetail.Title>
			</EntityDetail.Header>
			<EntityDetail.Body>
				<EntityDetail.Fields items={summaryInfo} />
				<EntityDetail.Separator />
				<EntityDetail.Section title={changePresentation.title}>
					{changePresentation.mode === "diff" ? (
						<AuditDiffList
							entries={changePresentation.entries as AuditChangeDiffEntry[]}
						/>
					) : changePresentation.mode === "snapshot" ? (
						<AuditValueList
							entries={changePresentation.entries as AuditChangeValueEntry[]}
						/>
					) : (
						<p className="text-sm text-muted-foreground">
							Nenhum detalhamento estruturado disponível para este registro.
						</p>
					)}
				</EntityDetail.Section>
				{changePresentation.rawJson ? (
					<>
						<EntityDetail.Separator />
						<EntityDetail.Section title="Payload técnico">
							<pre className="overflow-x-auto rounded-md border bg-muted/30 p-3 text-xs text-foreground">
								{changePresentation.rawJson}
							</pre>
						</EntityDetail.Section>
					</>
				) : null}
			</EntityDetail.Body>
			<EntityDetail.Footer />
		</EntityDetail.Content>
	);
};

interface AuditDiffListProps {
	entries: AuditChangeDiffEntry[];
}

const AuditDiffList = ({ entries }: AuditDiffListProps) => {
	if (entries.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				Nenhuma diferença legível encontrada no payload deste registro.
			</p>
		);
	}

	return (
		<div className="rounded-md border">
			<div className="hidden grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3 border-b bg-muted/30 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-foreground/60 md:grid">
				<span>Campo</span>
				<span>Antes</span>
				<span>Depois</span>
			</div>
			<div className="divide-y">
				{entries.map((entry) => (
					<div
						key={entry.path}
						className="grid gap-2 px-3 py-2 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] md:gap-3"
					>
						<div className="min-w-0">
							<p className="text-[11px] uppercase tracking-wide text-foreground/60 md:hidden">
								Campo
							</p>
							<p className="wrap-break-word text-sm font-medium text-foreground">
								{entry.label}
							</p>
						</div>
						<div className="min-w-0">
							<p className="text-[11px] uppercase tracking-wide text-foreground/60 md:hidden">
								Antes
							</p>
							<p className="wrap-break-word text-sm text-foreground">
								{entry.before}
							</p>
						</div>
						<div className="min-w-0">
							<p className="text-[11px] uppercase tracking-wide text-foreground/60 md:hidden">
								Depois
							</p>
							<p className="wrap-break-word text-sm text-foreground">
								{entry.after}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

interface AuditValueListProps {
	entries: AuditChangeValueEntry[];
}

const AuditValueList = ({ entries }: AuditValueListProps) => {
	if (entries.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				Nenhum campo estruturado disponível para este registro.
			</p>
		);
	}

	return (
		<EntityDetail.Fields
			items={entries.map((entry) => ({
				term: entry.label,
				definition: entry.value,
			}))}
		/>
	);
};

const AuditLogDetailsFallback = () => (
	<EntityDetail.Content>
		<EntityDetail.Header>
			<EntityDetail.Title>
				<EntityDetail.SkeletonTitle />
			</EntityDetail.Title>
		</EntityDetail.Header>
		<EntityDetail.Body>
			<EntityDetail.SkeletonFields rows={10} />
			<EntityDetail.Separator />
			<section className="flex flex-col gap-2">
				<Skeleton className="h-3 w-28" />
				<EntityDetail.SkeletonFields rows={4} />
			</section>
			<EntityDetail.Separator />
			<section className="flex flex-col gap-2">
				<Skeleton className="h-3 w-28" />
				<div className="rounded-md border bg-muted/30 p-3">
					<div className="flex flex-col gap-2">
						<Skeleton className="h-3 w-full" />
						<Skeleton className="h-3 w-full" />
						<Skeleton className="h-3 w-5/6" />
						<Skeleton className="h-3 w-2/3" />
					</div>
				</div>
			</section>
		</EntityDetail.Body>
		<EntityDetail.Footer />
	</EntityDetail.Content>
);
