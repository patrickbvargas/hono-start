import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ScrollArea,
} from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import { BREAKDOWN_CHART_CONFIG } from "../../constants/charts";
import type { BreakdownItem } from "../../schemas/model";
import { formatCompactCurrency } from "../../utils/format";
import { ChartHelp } from "../chart-help";
import { DrilldownBarShape } from "../drilldown/bar-shape";

interface BreakdownCardProps {
	title: string;
	description?: string;
	items: BreakdownItem[];
	emptyLabel?: string;
	color?: string;
	onSelect?: (item: BreakdownItem, trigger?: SVGElement) => void;
}

export function BreakdownCard({
	title,
	description,
	items,
	emptyLabel = "Sem registros no período.",
	color = "var(--chart-1)",
	onSelect,
}: BreakdownCardProps) {
	const hasValues = items.some((item) => item.total > 0);

	return (
		<Card className="min-w-0 h-80 min-h-80 flex flex-col">
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-base font-semibold">
					{title}
					{description ? (
						<ChartHelp title={title} description={description} />
					) : null}
				</CardTitle>
			</CardHeader>
			<CardContent className="flex min-h-0 flex-1 flex-col gap-3 pt-0">
				{hasValues ? (
					<ScrollArea
						className="min-h-0 min-w-0 flex-1"
						tabIndex={0}
						aria-label={`Gráfico de ${title}`}
					>
						<ChartContainer
							config={BREAKDOWN_CHART_CONFIG}
							className="w-full aspect-auto"
							style={{ height: Math.max(240, items.length * 52) }}
						>
							<BarChart
								accessibilityLayer
								data={items}
								layout="vertical"
								margin={{ top: 4, bottom: 4, left: 0, right: 80 }}
							>
								<XAxis type="number" domain={[0, "dataMax"]} hide />
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
									dataKey="total"
									fill={color}
									radius={6}
									shape={(props) => (
										<DrilldownBarShape
											{...props}
											label={`${title} · ${items[props.index]?.label ?? ""}`}
											onActivate={
												onSelect && items[props.index]
													? (trigger) => onSelect(items[props.index], trigger)
													: undefined
											}
										/>
									)}
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
				) : (
					<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
						{emptyLabel}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
