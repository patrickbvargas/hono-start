import { ScrollArea } from "@/shared/components/ui";
import { useFinancialDrilldown } from "../hooks/use-drilldown";
import type { FinancialOverviewSummary } from "../schemas/model";
import {
	type FinancialOverviewSearch,
	financialOverviewSearchSchema,
} from "../schemas/search";
import { BreakdownCard } from "./breakdown/breakdown-card";
import { FinancialMetricCards } from "./cards/metric-cards";
import { CashFlowChart } from "./chart/cash-flow-chart";
import { FinancialDrilldownModal } from "./drilldown/modal";
import { type CashFlowColumnKey, CashFlowTable } from "./table/cash-flow-table";

interface FinancialOverviewProps {
	data: FinancialOverviewSummary;
	showDetails?: boolean;
	search?: FinancialOverviewSearch;
}

export function FinancialOverview({
	data,
	showDetails = false,
	search = financialOverviewSearchSchema.parse({}),
}: FinancialOverviewProps) {
	const drilldown = useFinancialDrilldown();
	const referenceAt = data.referenceDate ?? new Date().toISOString();

	return (
		<ScrollArea hideScrollbar className="h-full min-h-0 flex flex-col gap-4">
			<div className="flex flex-col gap-4 p-0.5">
				{/* Metric Cards */}
				<FinancialMetricCards
					metrics={data.metrics}
					onSelect={(metric, trigger) => {
						if (metric.drilldown) {
							drilldown.open(
								{
									selection: { kind: "metric", value: metric.drilldown },
									title: metric.label,
									expectedAmount: metric.value,
								},
								trigger,
							);
						}
					}}
				/>

				{/* Charts Grid */}
				<div className="grid gap-3 md:grid-cols-3">
					<div className="col-span-full">
						<CashFlowChart
							items={data.monthlyEvolution}
							onSelect={(item, series, trigger) => {
								const seriesTitles: Record<string, string> = {
									entryRealized: "Entradas Realizadas",
									entryProjected: "Entradas Previstas",
									outputRealized: "Saídas Realizadas",
									outputProjected: "Saídas Previstas",
									balanceTotal: "Saldo do Mês",
								};
								drilldown.open(
									{
										selection: {
											kind: "monthly",
											month: item.month,
											series,
										},
										title: `${seriesTitles[series] ?? "Movimento"} · ${item.monthLabel}`,
										expectedAmount: item[series],
									},
									trigger,
								);
							}}
						/>
					</div>
					<BreakdownCard
						title="Títulos em atraso"
						description="Aging de duplicatas vencidas e não baixadas"
						items={data.aging}
						emptyLabel="Sem títulos vencidos no período."
						color="var(--chart-1)"
						onSelect={(item, trigger) =>
							drilldown.openBreakdown(
								"aging",
								item,
								"Títulos em atraso",
								trigger,
							)
						}
					/>
					<BreakdownCard
						title="Títulos a vencer"
						description="Previsão de vencimentos a curto prazo (próximos 90 dias)"
						items={data.forecast}
						emptyLabel="Sem parcelas a vencer nos próximos 90 dias."
						color="var(--chart-1)"
						onSelect={(item, trigger) =>
							drilldown.openBreakdown(
								"forecast",
								item,
								"Títulos a vencer",
								trigger,
							)
						}
					/>
					<BreakdownCard
						title="Pagamentos por analítica"
						description="Saídas pagas agrupadas por analítica financeira"
						items={data.expenseCategories}
						emptyLabel="Sem pagamentos no período."
						color="var(--chart-1)"
						onSelect={(item, trigger) =>
							drilldown.openBreakdown(
								"category",
								item,
								"Pagamentos por analítica",
								trigger,
							)
						}
					/>
				</div>

				{/* Detailed Cash Flow Statement Table */}
				{showDetails ? (
					<CashFlowTable
						rows={data.table}
						onSelect={(row, column: CashFlowColumnKey, trigger) => {
							const colTitles: Record<CashFlowColumnKey, string> = {
								entryRealized: "Entradas Realizadas",
								entryProjected: "Entradas Previstas",
								entryTotal: "Total de Entradas",
								remunerationPaid: "Remunerações",
								expensePaid: "Despesas",
								outputProjected: "Saídas Previstas",
								outputTotal: "Total de Saídas",
								balanceTotal: "Saldo do Mês",
							};
							drilldown.open(
								{
									selection: {
										kind: "monthly",
										month: row.month,
										series: column,
									},
									title: `${colTitles[column] ?? "Movimento"} · ${row.monthLabel}`,
									expectedAmount: row[column],
								},
								trigger,
							);
						}}
					/>
				) : null}

				{/* Drilldown Modal */}
				{drilldown.details.render((target, state) => (
					<FinancialDrilldownModal
						target={target}
						search={search}
						referenceAt={referenceAt}
						state={state}
						returnFocus={drilldown.returnFocus.current}
					/>
				))}
			</div>
		</ScrollArea>
	);
}
