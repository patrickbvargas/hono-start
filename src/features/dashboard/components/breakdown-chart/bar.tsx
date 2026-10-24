import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ScrollArea,
} from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import { BREAKDOWN_BAR_CHART_CONFIG } from "../../constants/charts";
import type { DashboardBreakdownItem } from "../../schemas/model";
import { formatCompactCurrency } from "../../utils/format";
import { DrilldownBarShape } from "../drilldown/bar-shape";

interface BreakdownItemsProps {
	items: DashboardBreakdownItem[];
	onSelect?: (item: DashboardBreakdownItem, trigger?: SVGElement) => void;
}

export function BreakdownBarChart({ items, onSelect }: BreakdownItemsProps) {
	return (
		<ScrollArea
			className="h-64 w-full min-w-0"
			tabIndex={0}
			aria-label="Gráfico de barras com rolagem"
		>
			<ChartContainer
				config={BREAKDOWN_BAR_CHART_CONFIG}
				className="w-full aspect-auto"
				style={{ height: Math.max(256, items.length * 56) }}
			>
				<BarChart
					accessibilityLayer
					data={items}
					layout="vertical"
					margin={{ top: 4, bottom: 4, left: 0, right: 80 }}
				>
					<XAxis
						type="number"
						domain={[0, "dataMax"]}
						hide
						tickFormatter={formatCompactCurrency}
					/>
					<YAxis
						dataKey="label"
						type="category"
						axisLine={false}
						tickLine={false}
						width="auto"
						tick={{ fontSize: 12 }}
						tickMargin={12}
						interval={0}
					/>
					<ChartTooltip
						cursor={false}
						content={
							<ChartTooltipContent
								labelFormatter={(value) => String(value)}
								valueFormatter={(value) =>
									formatter.currency(Number(value ?? 0))
								}
							/>
						}
					/>
					<Bar
						shape={(props) => (
							<DrilldownBarShape
								{...props}
								label={items[props.index]?.label ?? "valor"}
								onActivate={
									onSelect && items[props.index]
										? (trigger) => onSelect(items[props.index], trigger)
										: undefined
								}
							/>
						)}
						dataKey="total"
						fill="var(--color-total)"
						radius={6}
					>
						<LabelList
							dataKey="total"
							formatter={(value) => formatCompactCurrency(Number(value))}
							position="right"
							offset={8}
							className="fill-muted-foreground text-xs"
						/>
					</Bar>
				</BarChart>
			</ChartContainer>
		</ScrollArea>
	);
}
