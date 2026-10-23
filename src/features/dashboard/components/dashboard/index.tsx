import { ScrollArea } from "@/shared/components/ui";
import type { DashboardSummary } from "../../schemas/model";
import { DashboardBreakdownChart } from "../breakdown-chart";
import { DashboardCashFlowChart } from "../cash-flow-chart";
import { DashboardCashFlowTable } from "../cash-flow-table";
import { FinancialEvolutionChart } from "../financial-evolution-chart";
import { DashboardMetricCards } from "../metric-cards";
import { DashboardOverdueInstallmentsTable } from "../overdue-table";
import { DashboardRemunerationTable } from "../remuneration-table";

interface DashboardProps {
	data: DashboardSummary;
	showDetails?: boolean;
}

export function Dashboard({ data, showDetails = false }: DashboardProps) {
	const hasDetails = Boolean(
		data.visibility?.revenue ||
			data.visibility?.remuneration ||
			data.analysis ||
			data.expenseRevenue?.length ||
			data.cashFlow,
	);
	return (
		<ScrollArea hideScrollbar className="h-full min-h-0 flex flex-col gap-4">
			<div className="flex flex-col gap-4 p-0.5">
				<DashboardMetricCards metrics={data.metrics} />

				<div className="grid gap-3 xl:grid-cols-2">
					{data.visibility?.evolution ? (
						<FinancialEvolutionChart items={data.financialEvolution} />
					) : null}
					{data.cashFlow ? (
						<DashboardCashFlowChart items={data.cashFlow.chart} />
					) : null}
					{data.visibility?.revenue ? (
						<DashboardBreakdownChart
							title="Receita por área"
							items={data.legalAreaRevenue}
							emptyLabel="Nenhuma receita recebida por área."
							variant="column"
						/>
					) : null}
					{hasDetails && showDetails ? (
						<>
							{data.remunerationByAssignment ? (
								<DashboardBreakdownChart
									title="Remunerações por função"
									items={data.remunerationByAssignment}
									emptyLabel="Sem remunerações."
									variant="column"
								/>
							) : null}
							{data.visibility?.revenue ? (
								<DashboardBreakdownChart
									title="Receita por tipo"
									items={data.revenueTypeRevenue}
									emptyLabel="Nenhuma receita recebida por tipo."
									variant="column"
								/>
							) : null}
							{data.analysis ? (
								<>
									<DashboardBreakdownChart
										title="Recebimentos futuros em aberto"
										items={data.analysis.forecast}
										emptyLabel="Sem parcelas futuras nos próximos 90 dias."
										variant="column"
									/>
									<DashboardBreakdownChart
										title="Dívida por tempo de atraso"
										items={data.analysis.aging}
										emptyLabel="Sem dívida vencida."
										variant="column"
									/>
									<DashboardBreakdownChart
										title="Receita por cliente"
										items={data.analysis.clients}
										emptyLabel="Sem recebimentos."
										variant="bar"
									/>
								</>
							) : null}
							{data.expenseRevenue?.length ? (
								<DashboardBreakdownChart
									title="Despesas por categoria"
									items={data.expenseRevenue}
									emptyLabel="Sem despesas."
									variant="bar"
								/>
							) : null}
							<div className="col-span-full flex flex-col gap-4">
								{data.cashFlow ? (
									<DashboardCashFlowTable rows={data.cashFlow.table} />
								) : null}
								{data.visibility?.remuneration ? (
									<DashboardRemunerationTable
										months={data.remunerationMonths}
										rows={data.remunerationTable}
										subtotal={data.remunerationSubtotal}
									/>
								) : null}
								{data.visibility?.revenue ? (
									<DashboardOverdueInstallmentsTable
										rows={data.overdueInstallments}
									/>
								) : null}
							</div>
						</>
					) : null}
				</div>
			</div>
		</ScrollArea>
	);
}
