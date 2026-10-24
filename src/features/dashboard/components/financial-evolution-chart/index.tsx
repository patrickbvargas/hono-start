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
} from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import { FINANCIAL_EVOLUTION_CHART_CONFIG } from "../../constants/charts";
import type { DashboardFinancialEvolutionItem } from "../../schemas/model";
import { formatMonthLabel } from "../../utils/format";
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
			strokeWidth={2}
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
			item.remuneration !== 0 ||
			(item.expense ?? 0) !== 0 ||
			(item.result ?? 0) !== 0
		);
	});

	return (
		<Card className="min-h-85 col-span-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					Evolução financeira
					<ChartHelp
						title="Evolução financeira"
						description="Receita recebida e remunerações geradas por mês. Na visão consolidada, inclui despesas e a linha de resultado: receita − despesas."
					/>
				</CardTitle>
			</CardHeader>
			<CardContent className="flex min-h-0 flex-1 flex-col gap-3">
				<ChartContainer config={chartConfig} className="min-h-0 flex-1 w-full">
					<ComposedChart accessibilityLayer data={items} barGap={8}>
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
									labelFormatter={(value) => formatMonthLabel(String(value))}
									valueFormatter={(value) =>
										formatter.currency(Number(value ?? 0))
									}
								/>
							}
						/>
						<ChartLegend
							itemSorter={(item) => (item.dataKey === "result" ? 1 : 0)}
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
						/>
						<Bar
							dataKey="remuneration"
							shape={(props) => (
								<DrilldownBarShape
									{...props}
									label={`${chartConfig.remuneration.label} ${formatMonthLabel(items[props.index]?.month ?? "")}`}
									onActivate={
										onSelect && items[props.index]
											? (trigger) =>
													onSelect(items[props.index], "remuneration", trigger)
											: undefined
									}
								/>
							)}
							fill="var(--color-remuneration)"
							radius={4}
						/>
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
							/>
						) : null}
						{items.some((item) => item.result !== undefined) ? (
							<Line
								dataKey="result"
								stroke="var(--color-result)"
								strokeWidth={2}
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
														if (event.key === "Enter" || event.key === " ") {
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
				{hasValues ? null : (
					<p className="text-sm text-muted-foreground">
						Nenhum valor encontrado para os filtros selecionados.
					</p>
				)}
			</CardContent>
		</Card>
	);
}
