import { Bar, ComposedChart, Line, XAxis, YAxis } from "recharts";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
	ScrollArea,
} from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import { FINANCIAL_OVERVIEW_CHART_CONFIG } from "../../constants/charts";
import type { MonthlyCashFlowItem } from "../../schemas/model";
import { ChartHelp } from "../chart-help";
import { DrilldownBarShape } from "../drilldown/bar-shape";

interface CashFlowChartProps {
	items: MonthlyCashFlowItem[];
	onSelect?: (
		item: MonthlyCashFlowItem,
		series:
			| "entryRealized"
			| "entryProjected"
			| "outputRealized"
			| "outputProjected"
			| "balanceTotal",
		trigger?: SVGElement,
	) => void;
}

export function CashFlowChart({ items, onSelect }: CashFlowChartProps) {
	return (
		<Card className="min-w-0 h-80 min-h-80 col-span-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					Resumo mensal
					<ChartHelp
						title="Resumo mensal"
						description="Entradas e saídas de caixa realizadas e previstas por mês. Barras sólidas representam caixa realizado (recebido/pago). Barras tracejadas representam títulos previstos em aberto no mês atual e futuros. Linha representa saldo líquido."
					/>
				</CardTitle>
			</CardHeader>
			<CardContent className="flex min-h-0 flex-1 flex-col gap-3">
				<ScrollArea className="min-h-0 min-w-0 flex-1">
					<div className="h-full pb-5">
						<ChartContainer
							config={FINANCIAL_OVERVIEW_CHART_CONFIG}
							className="h-full min-h-0 w-full"
							style={{ minWidth: items.length * 132 + 48 }}
						>
							<ComposedChart
								accessibilityLayer
								data={items}
								barGap={8}
								margin={{ top: 24, bottom: 0, left: 24, right: 24 }}
							>
								<XAxis
									dataKey="monthLabel"
									axisLine={false}
									tickLine={false}
									tickMargin={10}
									height={40}
									minTickGap={24}
								/>
								<YAxis hide axisLine={false} tickLine={false} />
								<ChartTooltip
									cursor={false}
									content={
										<ChartTooltipContent
											formatter={(value, name) => [
												formatter.currency(Number(value ?? 0)),
												name,
											]}
										/>
									}
								/>
								<ChartLegend
									itemSorter={(item) =>
										[
											"entryRealized",
											"entryProjected",
											"outputRealized",
											"outputProjected",
											"balanceTotal",
										].indexOf(String(item.dataKey))
									}
									content={<ChartLegendContent />}
								/>
								<Bar
									dataKey="entryRealized"
									name="Entradas Realizadas"
									stackId="entry"
									fill="var(--chart-1)"
									radius={[4, 4, 0, 0]}
									shape={(props) => (
										<DrilldownBarShape
											{...props}
											label={`Entradas Realizadas · ${items[props.index]?.monthLabel ?? ""}`}
											onActivate={
												onSelect && items[props.index]
													? (trigger) =>
															onSelect(
																items[props.index],
																"entryRealized",
																trigger,
															)
													: undefined
											}
										/>
									)}
								/>
								<Bar
									dataKey="entryProjected"
									name="Entradas Previstas"
									stackId="entry"
									fill="var(--chart-1)"
									fillOpacity={0.35}
									stroke="var(--chart-1)"
									strokeDasharray="3 3"
									radius={[4, 4, 0, 0]}
									shape={(props) => (
										<DrilldownBarShape
											{...props}
											label={`Entradas Previstas · ${items[props.index]?.monthLabel ?? ""}`}
											onActivate={
												onSelect && items[props.index]
													? (trigger) =>
															onSelect(
																items[props.index],
																"entryProjected",
																trigger,
															)
													: undefined
											}
										/>
									)}
								/>
								<Bar
									dataKey="outputRealized"
									name="Saídas Realizadas"
									stackId="output"
									fill="var(--chart-2)"
									radius={[4, 4, 0, 0]}
									shape={(props) => (
										<DrilldownBarShape
											{...props}
											label={`Saídas Realizadas · ${items[props.index]?.monthLabel ?? ""}`}
											onActivate={
												onSelect && items[props.index]
													? (trigger) =>
															onSelect(
																items[props.index],
																"outputRealized",
																trigger,
															)
													: undefined
											}
										/>
									)}
								/>
								<Bar
									dataKey="outputProjected"
									name="Saídas Previstas"
									stackId="output"
									fill="var(--chart-2)"
									fillOpacity={0.35}
									stroke="var(--chart-2)"
									strokeDasharray="3 3"
									radius={[4, 4, 0, 0]}
									shape={(props) => (
										<DrilldownBarShape
											{...props}
											label={`Saídas Previstas · ${items[props.index]?.monthLabel ?? ""}`}
											onActivate={
												onSelect && items[props.index]
													? (trigger) =>
															onSelect(
																items[props.index],
																"outputProjected",
																trigger,
															)
													: undefined
											}
										/>
									)}
								/>
								<Line
									type="monotone"
									dataKey="balanceTotal"
									name="Saldo Líquido"
									stroke="var(--chart-3)"
									strokeWidth={2.5}
									dot={{ r: 3 }}
								/>
							</ComposedChart>
						</ChartContainer>
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
