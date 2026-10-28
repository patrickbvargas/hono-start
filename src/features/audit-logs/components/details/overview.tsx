import * as React from "react";
import {
	type DetailFieldItem,
	EntityDetail,
} from "@/shared/components/entity-detail";
import { FormSection } from "@/shared/components/form-section";
import { ScrollArea } from "@/shared/components/ui";
import { SensitiveValue } from "@/shared/components/value-visibility";
import type { EntityId } from "@/shared/schemas/entity";
import { AUDIT_ACTION_LABELS } from "../../constants/display";
import { useAuditLog } from "../../hooks/use-data";
import {
	type AuditChangeDiffEntry,
	type AuditChangeValueEntry,
	buildAuditChangePresentation,
} from "../../utils/change-details";

interface AuditLogOverviewProps {
	section?: "all" | "overview" | "changes" | "technical";
	id: EntityId;
}
export const AuditLogOverview = ({
	id,
	section = "all",
}: AuditLogOverviewProps) => {
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
			{
				term: "Ação",
				definition:
					AUDIT_ACTION_LABELS[auditLog.action] ?? auditLog.action ?? "—",
			},
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

	const ChangesSection =
		section === "changes" ? FormSection : EntityDetail.Section;
	const changes = (
		<ChangesSection title={changePresentation.title}>
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
					{changePresentation.mode === "none"
						? "Eventos de criação não exibem mudanças de campos no resumo."
						: "Nenhum detalhamento estruturado disponível para este registro."}
				</p>
			)}
		</ChangesSection>
	);
	if (section === "overview") {
		return (
			<FormSection title="Dados do evento">
				<EntityDetail.Fields
					columns={2}
					items={summaryInfo.filter((_, index) => index !== 7 && index !== 8)}
				/>
			</FormSection>
		);
	}
	if (section === "changes") {
		return changes;
	}
	if (section === "technical") {
		return (
			<FormSection title="Dados técnicos">
				<EntityDetail.Fields columns={2} items={summaryInfo.slice(7, 9)} />
				{changePresentation.rawJson ? (
					<ScrollArea className="min-w-0 rounded-md border bg-muted/30">
						<pre className="w-max min-w-full p-3 pb-5 text-xs text-foreground">
							<SensitiveValue>{changePresentation.rawJson}</SensitiveValue>
						</pre>
					</ScrollArea>
				) : (
					<p className="text-sm text-muted-foreground">
						Nenhum payload técnico disponível.
					</p>
				)}
			</FormSection>
		);
	}

	return (
		<div className="flex min-w-0 flex-col gap-3">
			<EntityDetail.Fields columns={2} items={summaryInfo} />
			{changePresentation.mode !== "none" ? (
				<>
					<EntityDetail.Separator />
					{changes}
				</>
			) : null}
			{changePresentation.rawJson ? (
				<>
					<EntityDetail.Separator />
					<EntityDetail.Section title="Payload técnico">
						<ScrollArea className="min-w-0 rounded-md border bg-muted/30">
							<pre className="w-max min-w-full p-3 pb-5 text-xs text-foreground">
								<SensitiveValue>{changePresentation.rawJson}</SensitiveValue>
							</pre>
						</ScrollArea>
					</EntityDetail.Section>
				</>
			) : null}
		</div>
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
			<div className="hidden grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3 border-b bg-muted/30 px-3 py-2 text-xs font-medium uppercase tracking-wide text-foreground/60 md:grid">
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
							<p className="text-xs uppercase tracking-wide text-foreground/60 md:hidden">
								Campo
							</p>
							<p className="wrap-break-word text-sm font-medium text-foreground">
								{entry.label}
							</p>
						</div>
						<div className="min-w-0">
							<p className="text-xs uppercase tracking-wide text-foreground/60 md:hidden">
								Antes
							</p>
							<p className="wrap-break-word text-sm text-foreground">
								{entry.before.includes("R$") ? (
									<SensitiveValue>{entry.before}</SensitiveValue>
								) : (
									entry.before
								)}
							</p>
						</div>
						<div className="min-w-0">
							<p className="text-xs uppercase tracking-wide text-foreground/60 md:hidden">
								Depois
							</p>
							<p className="wrap-break-word text-sm text-foreground">
								{entry.after.includes("R$") ? (
									<SensitiveValue>{entry.after}</SensitiveValue>
								) : (
									entry.after
								)}
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
				definition: entry.value.includes("R$") ? (
					<SensitiveValue>{entry.value}</SensitiveValue>
				) : (
					entry.value
				),
			}))}
		/>
	);
};
