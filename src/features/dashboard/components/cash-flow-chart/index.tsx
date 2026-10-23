import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	ChartContainer,
	ChartTooltip,
} from "@/shared/components/ui";
import { CASH_FLOW_CHART_CONFIG } from "../../constants/charts";
import type { DashboardCashFlowChartItem } from "../../schemas/model";
import { formatCompactCurrency, formatMonthLabel } from "../../utils/format";
import { ChartHelp } from "../chart-help";
import { DrilldownBarShape } from "../drilldown/bar-shape";
import { CashFlowTooltip } from "./tooltip";

interface DashboardCashFlowChartProps {
	items: DashboardCashFlowChartItem[];
	onSelect?: (item: DashboardCashFlowChartItem, trigger?: SVGElement) => void;
}

export function DashboardCashFlowChart({
	items,
	onSelect,
}: DashboardCashFlowChartProps) {
	const hasValues = items.some((item) => item.balance !== 0);

	return (
		<Card className="min-h-85">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					Saldo mensal
					<ChartHelp
						title="Saldo mensal"
						description="Balanço mensal: entrada = administrativo + judicial + sucumbência; saída = remunerações geradas + despesas; saldo = entrada − saída. Sem saldo bancário inicial."
					/>
				</CardTitle>
			</CardHeader>
			<CardContent className="flex min-h-0 flex-1 flex-col gap-3">
				<ChartContainer
					config={CASH_FLOW_CHART_CONFIG}
					className="min-h-0 flex-1 w-full"
				>
					<BarChart
						accessibilityLayer
						data={items}
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
						<ChartTooltip cursor={false} content={<CashFlowTooltip />} />
						<Bar
							shape={(props) => (
								<DrilldownBarShape
									{...props}
									label={`Saldo mensal ${formatMonthLabel(items[props.index]?.month ?? "")}`}
									onActivate={
										onSelect && items[props.index]
											? (trigger) => onSelect(items[props.index], trigger)
											: undefined
									}
								/>
							)}
							dataKey="balance"
							stroke="var(--color-balance)"
							fill="var(--color-balance)"
							radius={4}
						>
							<LabelList
								dataKey="balance"
								position="top"
								offset={8}
								className="fill-muted-foreground text-xs"
								formatter={(value) =>
									Number(value) >= 0 ? formatCompactCurrency(Number(value)) : ""
								}
							/>
							<LabelList
								dataKey="balance"
								position="bottom"
								offset={8}
								className="fill-muted-foreground text-xs"
								formatter={(value) =>
									Number(value) < 0 ? formatCompactCurrency(Number(value)) : ""
								}
							/>
						</Bar>
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
