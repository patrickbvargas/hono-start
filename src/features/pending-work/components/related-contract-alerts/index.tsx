import { RelatedRecordLink } from "@/features/related-records";
import { NavigationLink } from "@/shared/components/navigation-link";
import { SectionTitle } from "@/shared/components/section-title";
import { Button, ScrollArea, Skeleton } from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import { useRelatedContractAlerts } from "../../hooks/use-related-contract-alerts";
import { PendingWorkDueDate } from "../due-date";
import { PendingWorkSeverity } from "../severity";

interface RelatedContractAlertsProps {
	kind: "client" | "employee";
	id: EntityId;
}

export function RelatedContractAlerts(props: RelatedContractAlertsProps) {
	const session = useLoggedUserSession();
	const canReadContracts =
		hasPermission(session, "org:contracts:read_all") ||
		hasPermission(session, "org:contracts:read_assigned");
	const canReadFees =
		hasPermission(session, "org:fees:read_all") ||
		hasPermission(session, "org:fees:read_assigned");
	if (!canReadContracts || !canReadFees) {
		return null;
	}
	return (
		<RelatedContractAlertsContent
			key={`${props.kind}:${props.id}`}
			{...props}
		/>
	);
}

function RelatedContractAlertsContent(props: RelatedContractAlertsProps) {
	const { pendingWork, isPending, error, retry, collectionSearch } =
		useRelatedContractAlerts(props);
	return (
		<section className="flex min-h-40 flex-1 flex-col gap-4">
			<div className="flex shrink-0 items-center justify-between gap-3">
				<SectionTitle>Alertas dos contratos</SectionTitle>
				<NavigationLink
					to="/pendencias"
					search={collectionSearch}
					state={{ resetFilterPanel: true }}
					aria-label={`Ver todos os alertas dos contratos deste ${props.kind === "client" ? "cliente" : "colaborador"}`}
				>
					Ver todos os alertas
				</NavigationLink>
			</div>
			{isPending ? (
				<div
					aria-label="Carregando alertas dos contratos"
					className="space-y-2"
				>
					{[1, 2].map((row) => (
						<Skeleton key={row} className="h-16 w-full" />
					))}
				</div>
			) : error ? (
				<div role="alert" className="space-y-3">
					<p className="shrink-0 text-sm text-muted-foreground">
						Não foi possível carregar os alertas dos contratos.
					</p>
					<Button variant="outline" onClick={() => void retry()}>
						Tentar novamente
					</Button>
				</div>
			) : !pendingWork?.total ? (
				<p className="text-sm text-muted-foreground">
					Nenhum alerta nos contratos vinculados.
				</p>
			) : (
				<>
					<p className="text-sm text-muted-foreground">
						{pendingWork.total} {pendingWork.total === 1 ? "alerta" : "alertas"}{" "}
						em {pendingWork.contracts}{" "}
						{pendingWork.contracts === 1 ? "contrato" : "contratos"}.
					</p>
					<ScrollArea className="min-h-0 flex-1">
						<ul
							className="divide-y rounded-lg border"
							aria-label="Alertas dos contratos vinculados"
						>
							{pendingWork.data.map((item) => (
								<li
									key={item.id}
									className="flex flex-wrap items-start justify-between gap-3 p-4"
								>
									<div className="min-w-0 flex-1 basis-52 space-y-2">
										<div className="flex flex-wrap items-center gap-2">
											<PendingWorkSeverity severity={item.severity} />
											<p className="text-sm font-medium">{item.title}</p>
										</div>
										<div className="text-sm">
											<RelatedRecordLink kind="contract" id={item.contractId}>
												{item.processNumber}
											</RelatedRecordLink>
										</div>
									</div>
									{(item.dueDate !== null || item.remainingAmount !== null) && (
										<div className="space-y-1 text-sm">
											<PendingWorkDueDate
												date={item.dueDate}
												overdueDays={item.overdueDays}
											/>
											{item.remainingAmount !== null && (
												<p className="text-muted-foreground">
													Saldo a receber:{" "}
													{formatter.currency(item.remainingAmount)}
												</p>
											)}
										</div>
									)}
								</li>
							))}
						</ul>
					</ScrollArea>
					{pendingWork.total > pendingWork.data.length && (
						<p className="shrink-0 text-sm text-muted-foreground">
							Exibindo {pendingWork.data.length} de {pendingWork.total} alertas.
							Consulte a lista para ver todos.
						</p>
					)}
				</>
			)}
		</section>
	);
}
