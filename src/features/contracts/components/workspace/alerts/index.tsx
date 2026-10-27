import { ArrowUpRightIcon } from "lucide-react";
import { PendingWorkDueDate } from "@/features/pending-work";
import { Badge, ScrollArea } from "@/shared/components/ui";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import type { getContractWorkspaceAlerts } from "../../../utils/workspace-alerts";

interface ContractAlertsProps {
	alerts: ReturnType<typeof getContractWorkspaceAlerts>;
	onNavigate: (tab: "finance" | "team") => void;
}

export function ContractAlerts({ alerts, onNavigate }: ContractAlertsProps) {
	return (
		<ScrollArea aria-label="Alertas do contrato" className="min-h-0 flex-1">
			<div className="space-y-3">
				{alerts.length === 0 ? (
					<p className="py-4 text-muted-foreground">
						Nenhum alerta identificado neste contrato.
					</p>
				) : (
					alerts.map((alert) => (
						<div
							key={alert.id}
							className="flex flex-wrap items-start justify-between gap-3 rounded-lg border p-4"
						>
							<div className="min-w-0 flex-1 basis-52 space-y-2">
								<div className="flex flex-wrap items-center gap-2">
									<h3 className="text-sm font-medium">{alert.title}</h3>
									<Badge
										variant="outline"
										className={
											{
												high: "border-transparent bg-red-600/10 text-red-700 dark:text-red-400",
												low: "border-transparent bg-blue-600/10 text-blue-700 dark:text-blue-400",
												medium:
													"border-transparent bg-amber-600/10 text-amber-800 dark:text-amber-400",
											}[alert.severity]
										}
									>
										{
											{
												high: "Alta",
												low: "Baixa",
												medium: "Média",
											}[alert.severity]
										}
									</Badge>
								</div>
								<button
									type="button"
									className="inline-flex max-w-full cursor-pointer items-baseline gap-1 rounded-sm text-left text-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
									onClick={() => onNavigate(alert.tab)}
								>
									{alert.tab === "finance"
										? "Abrir financeiro"
										: "Abrir equipe"}
									<ArrowUpRightIcon
										aria-hidden="true"
										className="relative top-0.5 size-3.5 shrink-0"
									/>
								</button>
							</div>
							<div className="space-y-2">
								{(alert.dueDate !== null || alert.remainingAmount !== null) && (
									<div className="space-y-2 text-sm">
										<PendingWorkDueDate
											inline
											date={alert.dueDate}
											overdueDays={alert.overdueDays}
										/>
										{alert.remainingAmount !== null && (
											<p className="text-muted-foreground">
												Saldo a receber:{" "}
												<SensitiveValue>
													{formatter.currency(alert.remainingAmount)}
												</SensitiveValue>
											</p>
										)}
									</div>
								)}
							</div>
						</div>
					))
				)}
			</div>
		</ScrollArea>
	);
}
