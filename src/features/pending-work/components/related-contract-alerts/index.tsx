import { RelatedRecordLink } from "@/features/related-records";
import { FormSection } from "@/shared/components/form-section";
import { NavigationLink } from "@/shared/components/navigation-link";
import { Button, ScrollArea, Skeleton } from "@/shared/components/ui";
import { SensitiveValue } from "@/shared/components/value-visibility";
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
	if (!isPending && !error && !pendingWork?.total) {
		return null;
	}
	return (
		<section className="flex min-h-0 flex-initial flex-col [&>[data-slot=form-section]]:min-h-0 [&>[data-slot=form-section]]:flex-auto [&>[data-slot=form-section]>div:first-child]:shrink-0 [&>[data-slot=form-section]>div:first-child]:items-center">
			<FormSection
				title="Alertas"
				className="min-h-0 flex-auto gap-3 overflow-hidden"
			>
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
						<ScrollArea className="min-h-0 flex-auto">
							<ul
								className="space-y-3"
								aria-label="Alertas dos contratos vinculados"
							>
								{pendingWork.data.map((item) => (
									<li
										key={item.id}
										className="flex flex-wrap items-start justify-between gap-3 rounded-lg border p-4"
									>
										<div className="min-w-0 flex-1 basis-52 space-y-2">
											<div className="flex flex-wrap items-center gap-2">
												<h3 className="text-sm font-medium">{item.title}</h3>
												<PendingWorkSeverity severity={item.severity} />
											</div>
											<div className="text-sm">
												<RelatedRecordLink kind="contract" id={item.contractId}>
													{item.processNumber}
												</RelatedRecordLink>
											</div>
										</div>
										{(item.dueDate !== null ||
											item.remainingAmount !== null) && (
											<div className="space-y-2 text-sm">
												<PendingWorkDueDate
													inline
													date={item.dueDate}
													overdueDays={item.overdueDays}
												/>
												{item.remainingAmount !== null && (
													<p className="text-muted-foreground">
														Saldo a receber:{" "}
														<SensitiveValue>
															{formatter.currency(item.remainingAmount)}
														</SensitiveValue>
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
								Exibindo {pendingWork.data.length} de {pendingWork.total}{" "}
								alertas. Consulte a lista para ver todos.
							</p>
						)}
					</>
				)}
				<div className="mt-3 shrink-0 text-sm">
					<NavigationLink
						to="/pendencias"
						search={collectionSearch}
						state={{ resetFilterPanel: true }}
						aria-label={`Ver todos os alertas dos contratos deste ${props.kind === "client" ? "cliente" : "colaborador"}`}
					>
						Ver todos os alertas
					</NavigationLink>
				</div>
			</FormSection>
		</section>
	);
}
