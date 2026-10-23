import {
	Bar,
	BarChart,
	CartesianGrid,
	LabelList,
	ReferenceLine,
	XAxis,
	YAxis,
} from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import { BREAKDOWN_BAR_CHART_CONFIG } from "../../constants/charts";
import type { DashboardBreakdownItem } from "../../schemas/model";
import { formatCompactCurrency } from "../../utils/format";
import { DrilldownBarShape } from "../drilldown/bar-shape";

interface BreakdownColumnChartProps {
	items: DashboardBreakdownItem[];
	onSelect?: (item: DashboardBreakdownItem, trigger?: SVGElement) => void;
}

export function BreakdownColumnChart({
	items,
	onSelect,
}: BreakdownColumnChartProps) {
	return (
		<ChartContainer
			config={BREAKDOWN_BAR_CHART_CONFIG}
			className="min-h-0 flex-1 w-full dark:[&_.recharts-cartesian-grid_line]:[stroke-opacity:0.05] dark:[&_.recharts-reference-line-line]:[stroke-opacity:0.05]"
		>
			<BarChart
				accessibilityLayer
				data={items}
				margin={{ top: 24, bottom: 0, left: 24, right: 24 }}
			>
				<CartesianGrid vertical={false} strokeOpacity={0.3} />
				<ReferenceLine
					y={0}
					stroke="var(--muted-foreground)"
					strokeOpacity={0.3}
				/>
				<XAxis
					dataKey="label"
					axisLine={false}
					tickLine={false}
					interval={0}
					tickMargin={10}
					minTickGap={24}
					height={40}
					tick={{ width: 88, fontSize: 12 }}
					tickFormatter={(value: string) =>
						value === "Próximos 30 dias" ? "Até 30 dias" : value
					}
				/>
				<YAxis hide axisLine={false} tickLine={false} />
				<ChartTooltip
					cursor={false}
					content={
						<ChartTooltipContent
							valueFormatter={(value) => formatter.currency(Number(value ?? 0))}
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
					stroke="var(--color-total)"
					fill="var(--color-total)"
					radius={4}
				>
					<LabelList
						dataKey="total"
						position="top"
						offset={8}
						className="fill-muted-foreground text-xs"
						formatter={(value) => formatCompactCurrency(Number(value))}
					/>
				</Bar>
			</BarChart>
		</ChartContainer>
	);
}
