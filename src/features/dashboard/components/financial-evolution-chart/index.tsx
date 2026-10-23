import {
	Bar,
	CartesianGrid,
	ComposedChart,
	Line,
	ReferenceLine,
	XAxis,
	YAxis,
} from "recharts";
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

interface FinancialEvolutionChartProps {
	items: DashboardFinancialEvolutionItem[];
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
		<Card className="min-h-77 col-span-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					Evolução financeira
					<ChartHelp
						title="Evolução financeira"
						description="Recebimentos e remunerações geradas por mês, conforme filtros. Na visão completa da firma: despesas e resultado = receita − remunerações − despesas."
					/>
				</CardTitle>
			</CardHeader>
			<CardContent className="flex min-h-0 flex-1 flex-col gap-3">
				<ChartContainer
					config={chartConfig}
					className="min-h-0 flex-1 w-full dark:[&_.recharts-cartesian-grid_line]:[stroke-opacity:0.05] dark:[&_.recharts-reference-line-line]:[stroke-opacity:0.05]"
				>
					<ComposedChart accessibilityLayer data={items} barGap={8}>
						<CartesianGrid vertical={false} strokeOpacity={0.3} />
						<ReferenceLine
							y={0}
							stroke="var(--muted-foreground)"
							strokeOpacity={0.3}
						/>
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
							fill="var(--color-revenue)"
							radius={[4, 4, 0, 0]}
						/>
						<Bar
							dataKey="remuneration"
							fill="var(--color-remuneration)"
							radius={[4, 4, 0, 0]}
						/>
						{items.some((item) => item.expense !== undefined) ? (
							<Bar
								dataKey="expense"
								fill="var(--color-expense)"
								radius={[4, 4, 0, 0]}
							/>
						) : null}
						{items.some((item) => item.result !== undefined) ? (
							<Line
								dataKey="result"
								stroke="var(--color-result)"
								strokeWidth={2}
								dot={false}
								type="linear"
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
