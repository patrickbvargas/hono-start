import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	LabelList,
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
import { getBreakdownColor } from "../../utils/breakdown";
import { formatCompactCurrency } from "../../utils/format";

interface BreakdownItemsProps {
	items: DashboardBreakdownItem[];
}

export function BreakdownBarChart({ items }: BreakdownItemsProps) {
	return (
		<ChartContainer config={BREAKDOWN_BAR_CHART_CONFIG} className="h-64 w-full">
			<BarChart
				accessibilityLayer
				data={items}
				layout="vertical"
				margin={{ left: 0, right: 100 }}
			>
				<CartesianGrid horizontal={false} vertical={false} />
				<XAxis type="number" hide tickFormatter={formatCompactCurrency} />
				<YAxis
					dataKey="label"
					type="category"
					axisLine={false}
					tickLine={false}
					width={104}
					interval={0}
				/>
				<ChartTooltip
					cursor={false}
					content={
						<ChartTooltipContent
							labelFormatter={(value) => String(value)}
							valueFormatter={(value) => formatter.currency(Number(value ?? 0))}
						/>
					}
				/>
				<Bar dataKey="total" fill="var(--color-total)" radius={6}>
					{items.map((item, index) => (
						<Cell key={item.value} fill={getBreakdownColor(index)} />
					))}
					<LabelList
						dataKey="formattedTotal"
						position="right"
						offset={8}
						className="fill-muted-foreground text-xs"
					/>
				</Bar>
			</BarChart>
		</ChartContainer>
	);
}
