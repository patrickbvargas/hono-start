import { ScrollArea } from "@/shared/components/ui";
import type { FinancialOverviewSummary } from "../schemas/model";
import { BreakdownCard } from "./breakdown/breakdown-card";
import { FinancialMetricCards } from "./cards/metric-cards";
import { CashFlowChart } from "./chart/cash-flow-chart";
import { CashFlowTable } from "./table/cash-flow-table";

interface FinancialOverviewProps {
	data: FinancialOverviewSummary;
	showDetails?: boolean;
}

export function FinancialOverview({
	data,
	showDetails = false,
}: FinancialOverviewProps) {
	return (
		<ScrollArea hideScrollbar className="h-full min-h-0 flex flex-col gap-4">
			<div className="flex flex-col gap-4 p-0.5">
				{/* Metric Cards */}
				<FinancialMetricCards metrics={data.metrics} />

				{/* Charts Grid */}
				<div className="grid gap-3 md:grid-cols-3">
					<div className="col-span-full">
						<CashFlowChart items={data.monthlyEvolution} />
					</div>
					<BreakdownCard
						title="Títulos em atraso"
						description="Aging de duplicatas vencidas e não baixadas"
						items={data.aging}
						emptyLabel="Sem títulos vencidos no período."
						color="var(--chart-1)"
					/>
					<BreakdownCard
						title="Títulos a vencer"
						description="Previsão de vencimentos a curto prazo (próximos 90 dias)"
						items={data.forecast}
						emptyLabel="Sem parcelas a vencer nos próximos 90 dias."
						color="var(--chart-1)"
					/>
					<BreakdownCard
						title="Pagamentos por analítica"
						description="Saídas pagas agrupadas por analítica financeira"
						items={data.expenseCategories}
						emptyLabel="Sem pagamentos no período."
						color="var(--chart-1)"
					/>
				</div>

				{/* Detailed Cash Flow Statement Table */}
				{showDetails ? <CashFlowTable rows={data.table} /> : null}
			</div>
		</ScrollArea>
	);
}
