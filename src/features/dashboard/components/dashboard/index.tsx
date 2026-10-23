import { ScrollArea } from "@/shared/components/ui";
import type { EntityId } from "@/shared/schemas/entity";
import { useDashboardDrilldown } from "../../hooks/use-drilldown";
import type { DashboardSummary } from "../../schemas/model";
import type { DashboardSearch } from "../../schemas/search";
import { dashboardSearchSchema } from "../../schemas/search";
import { formatMonthLabel } from "../../utils/format";
import { DashboardBreakdownChart } from "../breakdown-chart";
import { DashboardCashFlowChart } from "../cash-flow-chart";
import { DashboardCashFlowTable } from "../cash-flow-table";
import { cashFlowDrilldownSeries, labels } from "../cash-flow-table/columns";
import { DashboardDrilldownModal } from "../drilldown/modal";
import { FinancialEvolutionChart } from "../financial-evolution-chart";
import { DashboardMetricCards } from "../metric-cards";
import { DashboardOverdueInstallmentsTable } from "../overdue-table";
import { DashboardRemunerationTable } from "../remuneration-table";

interface DashboardProps {
	data: DashboardSummary;
	showDetails?: boolean;
	search?: DashboardSearch;
	onViewContract?: (id: EntityId) => void;
	onViewEmployee?: (id: EntityId) => void;
}

export function Dashboard({
	data,
	showDetails = false,
	search = dashboardSearchSchema.parse({}),
	onViewContract,
	onViewEmployee,
}: DashboardProps) {
	const drilldown = useDashboardDrilldown();

	const referenceAt =
		data.analysis?.referenceAt ??
		new Date(
			Math.min(
				Date.now(),
				search.dateTo
					? Date.parse(`${search.dateTo}T23:59:59.999Z`)
					: Date.now(),
			),
		).toISOString();
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
				<DashboardMetricCards
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
				{drilldown.details.render((target, state) => (
					<DashboardDrilldownModal
						target={target}
						search={search}
						referenceAt={referenceAt}
						state={state}
						returnFocus={drilldown.returnFocus.current}
					/>
				))}

				<div className="grid gap-3 xl:grid-cols-2">
					{data.visibility?.evolution ? (
						<FinancialEvolutionChart
							items={data.financialEvolution}
							onSelect={(item, series, trigger) =>
								drilldown.open(
									{
										selection: { kind: "monthly", month: item.month, series },
										title: `${{ revenue: "Receita", remuneration: "Remunerações geradas", expense: "Despesas", result: "Resultado" }[series]} · ${formatMonthLabel(item.month)}`,
										expectedAmount: item[series] ?? 0,
									},
									trigger,
								)
							}
						/>
					) : null}
					{data.cashFlow ? (
						<DashboardCashFlowChart
							items={data.cashFlow.chart}
							onSelect={(item, trigger) =>
								drilldown.open(
									{
										selection: {
											kind: "monthly",
											month: item.month,
											series: "result",
										},
										title: `Saldo mensal · ${formatMonthLabel(item.month)}`,
										expectedAmount: item.balance,
									},
									trigger,
								)
							}
						/>
					) : null}
					{data.visibility?.revenue ? (
						<DashboardBreakdownChart
							title="Receita por área"
							onSelect={(item, trigger) =>
								drilldown.openBreakdown(
									"area",
									item,
									"Receita por área",
									trigger,
								)
							}
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
									onSelect={(item, trigger) =>
										drilldown.openBreakdown(
											"function",
											item,
											"Remunerações por função",
											trigger,
										)
									}
									items={data.remunerationByAssignment}
									emptyLabel="Sem remunerações."
									variant="column"
								/>
							) : null}
							{data.visibility?.revenue ? (
								<DashboardBreakdownChart
									title="Receita por tipo"
									onSelect={(item, trigger) =>
										drilldown.openBreakdown(
											"type",
											item,
											"Receita por tipo",
											trigger,
										)
									}
									items={data.revenueTypeRevenue}
									emptyLabel="Nenhuma receita recebida por tipo."
									variant="column"
								/>
							) : null}
							{data.analysis ? (
								<>
									<DashboardBreakdownChart
										title="Recebimentos futuros em aberto"
										onSelect={(item, trigger) =>
											drilldown.openBreakdown(
												"forecast",
												item,
												"Recebimentos futuros em aberto",
												trigger,
											)
										}
										items={data.analysis.forecast}
										emptyLabel="Sem parcelas futuras nos próximos 90 dias."
										variant="column"
									/>
									<DashboardBreakdownChart
										title="Dívida por tempo de atraso"
										onSelect={(item, trigger) =>
											drilldown.openBreakdown(
												"aging",
												item,
												"Dívida por tempo de atraso",
												trigger,
											)
										}
										items={data.analysis.aging}
										emptyLabel="Sem dívida vencida."
										variant="column"
									/>
									<DashboardBreakdownChart
										title="Receita por cliente"
										onSelect={(item, trigger) =>
											drilldown.openBreakdown(
												"client",
												item,
												"Receita por cliente",
												trigger,
											)
										}
										items={data.analysis.clients}
										emptyLabel="Sem recebimentos."
										variant="bar"
									/>
								</>
							) : null}
							{data.expenseRevenue?.length ? (
								<DashboardBreakdownChart
									title="Despesas por categoria"
									onSelect={(item, trigger) =>
										drilldown.openBreakdown(
											"expense",
											item,
											"Despesas por categoria",
											trigger,
										)
									}
									items={data.expenseRevenue}
									emptyLabel="Sem despesas."
									variant="bar"
								/>
							) : null}
							<div className="col-span-full flex flex-col gap-4">
								{data.cashFlow ? (
									<DashboardCashFlowTable
										rows={data.cashFlow.table}
										onSelect={(row, column, trigger) =>
											drilldown.open(
												{
													selection: {
														kind: "monthly",
														month: row.month,
														...cashFlowDrilldownSeries[column],
													},
													title: `${labels[column]} · ${row.monthLabel}`,
													expectedAmount: row[column],
												},
												trigger,
											)
										}
									/>
								) : null}
								{data.visibility?.remuneration ? (
									<DashboardRemunerationTable
										months={data.remunerationMonths}
										onViewEmployee={onViewEmployee}
										rows={data.remunerationTable}
										onSelect={(row, month, trigger) =>
											drilldown.open(
												{
													selection: {
														kind: "employee-month",
														employeeId: row.employeeId,
														month: month?.key,
													},
													title: `Remunerações · ${row.employeeName} · ${month?.label ?? "Total no período"}`,
													expectedAmount: month
														? (row.months[month.key] ?? 0)
														: row.total,
												},
												trigger,
											)
										}
										subtotal={data.remunerationSubtotal}
									/>
								) : null}
								{data.visibility?.revenue ? (
									<DashboardOverdueInstallmentsTable
										rows={data.overdueInstallments}
										onViewContract={onViewContract}
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
