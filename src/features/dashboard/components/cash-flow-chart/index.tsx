import { useId } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
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
	ChartTooltip,
} from "@/shared/components/ui";
import { CASH_FLOW_CHART_CONFIG } from "../../constants/charts";
import type { DashboardCashFlowChartItem } from "../../schemas/model";
import { formatMonthLabel } from "../../utils/format";
import { CashFlowTooltip } from "./tooltip";

interface DashboardCashFlowChartProps {
	items: DashboardCashFlowChartItem[];
}

export function DashboardCashFlowChart({ items }: DashboardCashFlowChartProps) {
	const gradientId = `cash-flow-gradient-${useId().replace(/:/g, "")}`;
	const hasValues = items.some((item) => item.balance !== 0);

	return (
		<Card className="h-80">
			<CardHeader>
				<CardTitle>Saldo mensal</CardTitle>
			</CardHeader>
			<CardContent className="flex min-h-0 flex-1 flex-col gap-3">
				<ChartContainer
					config={CASH_FLOW_CHART_CONFIG}
					className="min-h-0 flex-1 w-full dark:[&_.recharts-cartesian-grid_line]:[stroke-opacity:0.05] dark:[&_.recharts-reference-line-line]:[stroke-opacity:0.05]"
				>
					<AreaChart accessibilityLayer data={items}>
						<defs>
							<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor="var(--color-balance)"
									stopOpacity={0.8}
								/>
								<stop
									offset="95%"
									stopColor="var(--color-balance)"
									stopOpacity={0.1}
								/>
							</linearGradient>
						</defs>
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
							minTickGap={24}
							tickFormatter={formatMonthLabel}
						/>
						<YAxis hide axisLine={false} tickLine={false} />
						<ChartTooltip cursor={false} content={<CashFlowTooltip />} />
						<Area
							dataKey="balance"
							type="monotone"
							stroke="var(--color-balance)"
							fill={`url(#${gradientId})`}
							baseValue={0}
						/>
					</AreaChart>
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
