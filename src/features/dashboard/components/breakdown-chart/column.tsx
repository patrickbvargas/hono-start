import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import { BREAKDOWN_BAR_CHART_CONFIG } from "../../constants/charts";
import type { DashboardBreakdownItem } from "../../schemas/model";

interface BreakdownColumnChartProps {
	items: DashboardBreakdownItem[];
}

export function BreakdownColumnChart({ items }: BreakdownColumnChartProps) {
	return (
		<ChartContainer config={BREAKDOWN_BAR_CHART_CONFIG} className="h-64 w-full">
			<BarChart
				accessibilityLayer
				data={items}
				margin={{ left: 8, right: 8, bottom: 16 }}
			>
				<CartesianGrid vertical={false} strokeOpacity={0.15} />
				<XAxis
					dataKey="label"
					axisLine={false}
					tickLine={false}
					interval={0}
					tickMargin={12}
					tickFormatter={(value: string) =>
						value === "Próximos 30 dias" ? "Até 30 dias" : value
					}
				/>
				<YAxis hide />
				<ChartTooltip
					cursor={false}
					content={
						<ChartTooltipContent
							valueFormatter={(value) => formatter.currency(Number(value ?? 0))}
						/>
					}
				/>
				<Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
			</BarChart>
		</ChartContainer>
	);
}
