import { Link } from "@tanstack/react-router";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import type { DashboardOverdueInstallmentRow } from "../../schemas/model";

interface WorkPanelProps {
	rows: DashboardOverdueInstallmentRow[];
	scopeLabel: string;
	canOpenContracts: boolean;
}
export function DashboardWorkPanel({
	rows,
	scopeLabel,
	canOpenContracts,
}: WorkPanelProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Precisa de atenção</CardTitle>
				<p className="text-sm text-muted-foreground">
					Parcelas em atraso · {scopeLabel}. Prévia de até 3 itens nos filtros
					selecionados. Inclui vencimentos anteriores ao início do período.
				</p>
			</CardHeader>
			<CardContent>
				{rows.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						Nenhuma parcela em atraso nos filtros selecionados.
					</p>
				) : (
					<ul className="divide-y">
						{rows.slice(0, 3).map((row) => (
							<li
								key={`${row.contractId}-${row.revenueType}-${row.installmentNumber}`}
								className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0"
							>
								<div className="min-w-0">
									<p className="break-words font-medium">
										{row.clientName} · {row.contractProcessNumber}
									</p>
									<p className="text-sm text-muted-foreground">
										{row.revenueType} · Parcela {row.installmentNumber} ·
										Vencimento {formatter.calendarDate(row.dueDate)}
									</p>
								</div>
								<div className="flex items-center gap-3">
									<span className="whitespace-nowrap text-sm font-medium">
										{row.formattedInstallmentAmount}
									</span>
									{canOpenContracts && (
										<Link
											to="/contratos/$contractId"
											params={{ contractId: String(row.contractId) }}
											search={{ tab: "finance" }}
											className="text-sm underline underline-offset-4"
											aria-label={`Abrir financeiro de ${row.contractProcessNumber}`}
										>
											Abrir contrato
										</Link>
									)}
								</div>
							</li>
						))}
					</ul>
				)}
				<p className="mt-3 text-xs text-muted-foreground">
					Abra o contrato para conferir as parcelas e registrar o recebimento.
					Esta prévia não representa a quantidade total de pendências.
				</p>
			</CardContent>
		</Card>
	);
}
