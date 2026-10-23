import {
	Label,
	LabelList,
	Pie,
	PieChart,
	type PieSectorShapeProps,
	Sector,
} from "recharts";
import {
	ChartContainer,
	// ChartLegend,
	// ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import type { DashboardBreakdownItem } from "../../schemas/model";
import {
	buildDonutChartConfig,
	getBreakdownColor,
} from "../../utils/breakdown";

interface BreakdownItemsProps {
	items: DashboardBreakdownItem[];
}

const CustomDonutSector = (props: PieSectorShapeProps) => {
	return <Sector {...props} fill={getBreakdownColor(props.index)} />;
};

export function BreakdownDonutChart({ items }: BreakdownItemsProps) {
	const chartConfig = buildDonutChartConfig(items);
	const total = items.reduce((sum, item) => sum + item.total, 0);

	return (
		<ChartContainer config={chartConfig} className="h-64 w-full">
			<PieChart accessibilityLayer>
				<ChartTooltip
					cursor={false}
					content={
						<ChartTooltipContent
							hideLabel
							nameKey="value"
							valueFormatter={(value) => formatter.currency(Number(value ?? 0))}
						/>
					}
				/>
				{/* <ChartLegend content={<ChartLegendContent nameKey="value" />} /> */}
				<Pie
					data={items}
					dataKey="total"
					nameKey="value"
					cx="50%"
					cy="44%"
					innerRadius={64}
					outerRadius={88}
					paddingAngle={2}
					strokeWidth={0}
					shape={CustomDonutSector}
				>
					<LabelList
						dataKey="percentage"
						position="outside"
						className="fill-foreground text-xs"
						formatter={(value) => `${Number(value).toFixed(0)}%`}
					/>
					<Label
						content={({ viewBox }) => {
							if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) {
								return null;
							}
							return (
								<text
									x={viewBox.cx}
									y={viewBox.cy}
									textAnchor="middle"
									dominantBaseline="middle"
								>
									<tspan
										x={viewBox.cx}
										dy="-0.3em"
										className="fill-foreground text-xs font-semibold"
									>
										{formatter.currency(total)}
									</tspan>
									<tspan
										x={viewBox.cx}
										dy="1.5em"
										className="fill-muted-foreground text-xs"
									>
										Total recebido
									</tspan>
								</text>
							);
						}}
					/>
				</Pie>
			</PieChart>
		</ChartContainer>
	);
}
