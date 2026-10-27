import { Bar, ComposedChart, LabelList, Line, XAxis, YAxis } from "recharts";
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
import { FINANCIAL_EVOLUTION_CHART_CONFIG } from "../../constants/charts";
import type { DashboardFinancialEvolutionItem } from "../../schemas/model";
import { formatCompactCurrency, formatMonthLabel } from "../../utils/format";
import { ChartHelp } from "../chart-help";
import { DrilldownBarShape } from "../drilldown/bar-shape";

interface FinancialEvolutionChartProps {
	items: DashboardFinancialEvolutionItem[];
	onSelect?: (
		item: DashboardFinancialEvolutionItem,
		series: "revenue" | "remuneration" | "expense" | "result",
		trigger?: SVGElement,
	) => void;
}

interface ResultLegendIconProps {
	className?: string;
}

function ResultLegendIcon({ className }: ResultLegendIconProps) {
	return (
		<svg
			className={className}
			viewBox="0 0 16 16"
			fill="none"
			stroke="var(--color-result)"
			strokeWidth={3}
			aria-hidden="true"
		>
			<path d="M1 8h14" />
		</svg>
	);
}

const chartConfig = {
	...FINANCIAL_EVOLUTION_CHART_CONFIG,
	result: {
		...FINANCIAL_EVOLUTION_CHART_CONFIG.result,
		icon: ResultLegendIcon,
	},
};

export function FinancialEvolutionChart({
	items,
	onSelect,
}: FinancialEvolutionChartProps) {
	const hasValues = items.some((item) => {
		return (
			item.revenue !== 0 ||
			(item.expense ?? 0) !== 0 ||
			(item.result ?? 0) !== 0
		);
	});

	return (
		<Card className="min-w-0 h-80 min-h-80 col-span-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					Resultado mensal
					<ChartHelp
						title="Resultado mensal"
						description="Entradas: honorários recebidos. Saídas: despesas registradas. Resultado = entradas − saídas."
					/>
				</CardTitle>
			</CardHeader>
			<CardContent className="flex min-h-0 flex-1 flex-col gap-3">
				<ScrollArea className="min-h-0 min-w-0 flex-1">
					<div className="h-full pb-5">
						<ChartContainer
							config={chartConfig}
							className="h-full min-h-0 w-full"
							style={{ minWidth: items.length * 112 + 48 }}
						>
							<ComposedChart
								accessibilityLayer
								data={items}
								barGap={8}
								margin={{ top: 24, bottom: 0, left: 24, right: 24 }}
							>
								<XAxis
									dataKey="month"
									axisLine={false}
									tickLine={false}
									tickMargin={10}
									height={40}
									minTickGap={24}
									tickFormatter={formatMonthLabel}
								/>
								<YAxis hide axisLine={false} tickLine={false} />
								<ChartTooltip
									cursor={false}
									content={
										<ChartTooltipContent
											labelFormatter={(value) =>
												formatMonthLabel(String(value))
											}
											valueFormatter={(value) =>
												formatter.currency(Number(value ?? 0))
											}
										/>
									}
								/>
								<ChartLegend
									itemSorter={(item) =>
										["revenue", "expense", "result"].indexOf(
											String(item.dataKey),
										)
									}
									content={<ChartLegendContent />}
								/>
								<Bar
									dataKey="revenue"
									shape={(props) => (
										<DrilldownBarShape
											{...props}
											label={`${chartConfig.revenue.label} ${formatMonthLabel(items[props.index]?.month ?? "")}`}
											onActivate={
												onSelect && items[props.index]
													? (trigger) =>
															onSelect(items[props.index], "revenue", trigger)
													: undefined
											}
										/>
									)}
									fill="var(--color-revenue)"
									radius={4}
								>
									<LabelList
										dataKey="revenue"
										position="top"
										offset={8}
										className="fill-muted-foreground text-xs"
										formatter={(value) => formatCompactCurrency(Number(value))}
									/>
								</Bar>
								{items.some((item) => item.expense !== undefined) ? (
									<Bar
										dataKey="expense"
										shape={(props) => (
											<DrilldownBarShape
												{...props}
												label={`${chartConfig.expense.label} ${formatMonthLabel(items[props.index]?.month ?? "")}`}
												onActivate={
													onSelect && items[props.index]
														? (trigger) =>
																onSelect(items[props.index], "expense", trigger)
														: undefined
												}
											/>
										)}
										fill="var(--color-expense)"
										radius={4}
									>
										<LabelList
											dataKey="expense"
											position="top"
											offset={8}
											className="fill-muted-foreground text-xs"
											formatter={(value) =>
												formatCompactCurrency(Number(value))
											}
										/>
									</Bar>
								) : null}
								{items.some((item) => item.result !== undefined) ? (
									<Line
										dataKey="result"
										stroke="var(--color-result)"
										strokeWidth={3}
										activeDot={false}
										dot={
											onSelect
												? (props) => (
														<circle
															key={props.index}
															cx={props.cx}
															cy={props.cy}
															r={5}
															fill="var(--color-result)"
															fillOpacity={0}
															stroke="none"
															role="button"
															tabIndex={0}
															aria-label={`Detalhar Resultado ${formatMonthLabel(items[props.index]?.month ?? "")}`}
															className="cursor-pointer outline-none transition-[fill-opacity,stroke] hover:fill-opacity-100 hover:stroke-foreground/30 focus-visible:fill-opacity-100 focus-visible:stroke-foreground/30"
															pointerEvents="all"
															onClick={(event) => {
																onSelect(
																	items[props.index],
																	"result",
																	event.currentTarget,
																);
															}}
															onKeyDown={(event) => {
																if (
																	event.key === "Enter" ||
																	event.key === " "
																) {
																	event.preventDefault();
																	onSelect(
																		items[props.index],
																		"result",
																		event.currentTarget,
																	);
																}
															}}
														/>
													)
												: false
										}
										type="monotone"
									/>
								) : null}
							</ComposedChart>
						</ChartContainer>
					</div>
				</ScrollArea>
				{hasValues ? null : (
					<p className="text-sm text-muted-foreground">
						Nenhum valor encontrado para os filtros selecionados.
					</p>
				)}
			</CardContent>
		</Card>
	);
}
