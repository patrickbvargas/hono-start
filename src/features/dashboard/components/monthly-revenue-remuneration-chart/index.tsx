import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
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
import type { DashboardFinancialEvolutionItem } from "../../schemas/model";
import { formatCompactCurrency, formatMonthLabel } from "../../utils/format";
import { ChartHelp } from "../chart-help";
import { DrilldownBarShape } from "../drilldown/bar-shape";

interface MonthlyRevenueRemunerationChartProps {
	items: DashboardFinancialEvolutionItem[];
	isAdmin: boolean;
	onSelect?: (
		item: DashboardFinancialEvolutionItem,
		series: "revenue" | "remuneration",
		trigger?: SVGElement,
	) => void;
}

export function MonthlyRevenueRemunerationChart({
	items,
	isAdmin,
	onSelect,
}: MonthlyRevenueRemunerationChartProps) {
	const config = {
		revenue: { label: "Honorários recebidos", color: "var(--chart-1)" },
		remuneration: {
			label: isAdmin ? "Remunerações geradas" : "Minhas remunerações geradas",
			color: "var(--chart-2)",
		},
	};
	const hasValues = items.some(
		(item) => item.revenue !== 0 || item.remuneration !== 0,
	);
	return (
		<Card className="min-h-85 col-span-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					Resumo mensal
					<ChartHelp
						title="Resumo mensal"
						description={
							isAdmin
								? "Honorários recebidos e remunerações geradas, por mês. Não inclui despesas nem confirma repasses."
								: "Honorários recebidos nos contratos que você pode visualizar e remunerações geradas para você, por mês. Honorários do contrato não são remuneração pessoal. Não confirma repasses."
						}
					/>
				</CardTitle>
			</CardHeader>
			<CardContent className="flex min-h-0 flex-1 flex-col gap-3">
				<ChartContainer config={config} className="min-h-0 flex-1 w-full">
					<BarChart
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
									labelFormatter={(value) => formatMonthLabel(String(value))}
									valueFormatter={(value) =>
										formatter.currency(Number(value ?? 0))
									}
								/>
							}
						/>
						<ChartLegend
							itemSorter={(item) =>
								["revenue", "remuneration"].indexOf(String(item.dataKey))
							}
							content={<ChartLegendContent />}
						/>
						{(["revenue", "remuneration"] as const).map((series) => (
							<Bar
								key={series}
								dataKey={series}
								fill={`var(--color-${series})`}
								radius={4}
								shape={(props) => (
									<DrilldownBarShape
										{...props}
										label={`${config[series].label} ${formatMonthLabel(items[props.index]?.month ?? "")}`}
										onActivate={
											onSelect && items[props.index]
												? (trigger) =>
														onSelect(items[props.index], series, trigger)
												: undefined
										}
									/>
								)}
							>
								<LabelList
									dataKey={series}
									position="top"
									offset={8}
									className="fill-muted-foreground text-xs"
									formatter={(value) => formatCompactCurrency(Number(value))}
								/>
							</Bar>
						))}
					</BarChart>
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
