import { useMemo } from "react";
import { ScrollArea } from "@/shared/components/ui";
import type { EntityId } from "@/shared/schemas/entity";
import { useDashboardDrilldown } from "../../hooks/use-drilldown";
import type { DashboardSummary } from "../../schemas/model";
import type { DashboardSearch } from "../../schemas/search";
import { dashboardSearchSchema } from "../../schemas/search";
import { formatMonthLabel } from "../../utils/format";
import { DashboardBreakdownChart } from "../breakdown-chart";
import { DashboardCashFlowTable } from "../cash-flow-table";
import { cashFlowDrilldownSeries, labels } from "../cash-flow-table/columns";
import { DashboardDrilldownModal } from "../drilldown/modal";
import { FinancialEvolutionChart } from "../financial-evolution-chart";
import { DashboardMetricCards } from "../metric-cards";
import { MonthlyRevenueRemunerationChart } from "../monthly-revenue-remuneration-chart";
import { DashboardOverdueInstallmentsTable } from "../overdue-table";
import { DashboardRemunerationTable } from "../remuneration-table";
import { RevenueRemunerationBreakdownChart } from "../revenue-remuneration-breakdown-chart";
import { DashboardWorkPanel } from "../work-panel";

interface DashboardProps {
	data: DashboardSummary;
	showDetails?: boolean;
	showWorkPanel?: boolean;
	search?: DashboardSearch;
	onViewContract?: (id: EntityId) => void;
	onViewEmployee?: (id: EntityId) => void;
}

export function Dashboard({
	data,
	showDetails = false,
	showWorkPanel = false,
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
	const charts = useMemo(
		() => (
			<div className="grid gap-3 xl:grid-cols-2">
				{data.isAdmin && data.cashFlow && data.visibility?.evolution ? (
					<FinancialEvolutionChart
						items={data.financialEvolution}
						onSelect={(item, series, trigger) =>
							drilldown.open(
								{
									selection: { kind: "monthly", month: item.month, series },
									title: `${{ revenue: "Entradas", remuneration: "Remunerações geradas", expense: "Saídas", result: "Resultado" }[series]} · ${formatMonthLabel(item.month)}`,
									expectedAmount: item[series] ?? 0,
								},
								trigger,
							)
						}
					/>
				) : null}
				{data.visibility?.evolution ? (
					<MonthlyRevenueRemunerationChart
						items={data.financialEvolution}
						isAdmin={data.isAdmin}
						onSelect={(item, series, trigger) =>
							drilldown.open(
								{
									selection: { kind: "monthly", month: item.month, series },
									title: `${series === "revenue" ? "Honorários recebidos" : "Remunerações geradas"} · ${formatMonthLabel(item.month)}`,
									expectedAmount: item[series],
								},
								trigger,
							)
						}
					/>
				) : null}
				{data.visibility?.revenue
					? (["area", "type"] as const).map((kind) => (
							<RevenueRemunerationBreakdownChart
								key={kind}
								dimension={kind}
								title={kind === "area" ? "Resumo por área" : "Resumo por tipo"}
								items={
									kind === "area"
										? data.legalAreaRevenue
										: data.revenueTypeRevenue
								}
								isAdmin={data.isAdmin}
								onSelect={(item, series, trigger) =>
									drilldown.open(
										{
											selection: { kind, value: item.value, series },
											title: `${series === "revenue" ? "Honorários recebidos" : "Remunerações geradas"} · ${item.label}`,
											expectedAmount:
												series === "revenue"
													? item.total
													: (item.remuneration ?? 0),
										},
										trigger,
									)
								}
							/>
						))
					: null}
				{hasDetails && showDetails ? (
					<>
						{data.isAdmin && data.remunerationByCollaborator ? (
							<DashboardBreakdownChart
								title="Remunerações por colaborador"
								items={data.remunerationByCollaborator}
								emptyLabel="Sem remunerações no período."
								variant="bar"
								onSelect={(item, trigger) =>
									drilldown.open(
										{
											selection: {
												kind: "employee-month",
												employeeId: Number(item.value),
											},
											title: `Remunerações · ${item.label}`,
											expectedAmount: item.total,
										},
										trigger,
									)
								}
							/>
						) : null}
						{data.remunerationByAssignment ? (
							<DashboardBreakdownChart
								title="Remuneração por função"
								onSelect={(item, trigger) =>
									drilldown.openBreakdown(
										"function",
										item,
										"Remuneração por função",
										trigger,
									)
								}
								items={data.remunerationByAssignment}
								emptyLabel="Sem remunerações."
								variant="column"
							/>
						) : null}
						{data.analysis ? (
							<>
								<DashboardBreakdownChart
									title="Honorários em atraso"
									onSelect={(item, trigger) =>
										drilldown.openBreakdown(
											"aging",
											item,
											"Honorários em atraso",
											trigger,
										)
									}
									items={data.analysis.aging}
									emptyLabel="Sem dívida vencida."
									variant="column"
								/>
								<DashboardBreakdownChart
									title="Honorários a receber"
									onSelect={(item, trigger) =>
										drilldown.openBreakdown(
											"forecast",
											item,
											"Honorários a receber",
											trigger,
										)
									}
									items={data.analysis.forecast}
									emptyLabel="Sem parcelas futuras nos próximos 90 dias."
									variant="column"
								/>
							</>
						) : null}
						{data.analysis ? (
							<DashboardBreakdownChart
								title="Honorários por cliente"
								onSelect={(item, trigger) =>
									drilldown.openBreakdown(
										"client",
										item,
										"Honorários por cliente",
										trigger,
									)
								}
								items={data.analysis.clients}
								emptyLabel="Sem recebimentos."
								variant="bar"
							/>
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
		),
		[
			data,
			showDetails,
			hasDetails,
			onViewContract,
			onViewEmployee,
			drilldown.open,
			drilldown.openBreakdown,
		],
	);
	return (
		<ScrollArea hideScrollbar className="h-full min-h-0 flex flex-col gap-4">
			<div className="flex flex-col gap-4 p-0.5">
				{showWorkPanel && data.visibility?.revenue ? (
					<DashboardWorkPanel
						rows={data.overdueInstallments}
						scopeLabel={data.scopeLabel}
						canOpenContracts={!!onViewContract}
					/>
				) : null}
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

				{charts}
			</div>
		</ScrollArea>
	);
}
