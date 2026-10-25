import { Badge, Button } from "@/shared/components/ui";
import type { getContractWorkspaceAlerts } from "../../../utils/workspace-alerts";

interface ContractAlertsProps {
	alerts: ReturnType<typeof getContractWorkspaceAlerts>;
	onNavigate: (tab: "finance" | "team") => void;
}

export function ContractAlerts({ alerts, onNavigate }: ContractAlertsProps) {
	return (
		<section aria-label="Alertas do contrato" className="space-y-3">
			{alerts.length === 0 ? (
				<p className="py-4 text-muted-foreground">
					Nenhum alerta identificado neste contrato.
				</p>
			) : (
				alerts.map((alert) => (
					<div
						key={alert.id}
						className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
					>
						<div className="min-w-0 space-y-2">
							<div className="flex flex-wrap items-center gap-2">
								<h3 className="font-medium">{alert.title}</h3>
								<Badge
									variant="outline"
									className={
										{
											high: "border-transparent bg-red-600/10 text-red-700 dark:text-red-400",
											medium:
												"border-transparent bg-amber-600/10 text-amber-800 dark:text-amber-400",
											low: "border-transparent bg-blue-600/10 text-blue-700 dark:text-blue-400",
										}[alert.severity]
									}
								>
									{
										{ high: "Alta", medium: "Média", low: "Baixa" }[
											alert.severity
										]
									}
								</Badge>
							</div>
							<p className="text-sm text-muted-foreground">
								{alert.description}
							</p>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={() => onNavigate(alert.tab)}
						>
							{alert.tab === "finance" ? "Abrir financeiro" : "Abrir equipe"}
						</Button>
					</div>
				))
			)}
		</section>
	);
}
