import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	LabelList,
	Pie,
	PieChart,
	XAxis,
	YAxis,
} from "recharts";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import type { DashboardSummary } from "../schemas/model";

interface DashboardBreakdownChartProps {
	title: string;
	items: DashboardSummary["legalAreaRevenue"];
	emptyLabel: string;
	variant: "bar" | "donut";
}

const barChartConfig = {
	total: {
		label: "Receita",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

function getBreakdownColor(index: number) {
	const palette = [
		"var(--chart-1)",
		"var(--chart-2)",
		"var(--chart-3)",
		"var(--chart-4)",
		"var(--chart-5)",
	];

	return palette[index % palette.length] ?? "var(--chart-1)";
}

function buildDonutChartConfig(
	items: DashboardSummary["legalAreaRevenue"],
): ChartConfig {
	return items.reduce<ChartConfig>((config, item, index) => {
		config[item.value] = {
			label: item.label,
			color: getBreakdownColor(index),
		};

		return config;
	}, {});
}

function formatCompactCurrency(value: number) {
	if (value === 0) {
		return "R$ 0";
	}

	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
		notation: "compact",
		maximumFractionDigits: 1,
	}).format(value);
}

function renderBreakdownList(items: DashboardSummary["legalAreaRevenue"]) {
	return (
		<div className="space-y-2.5 border-t border-border/60 pt-3">
			{items.map((item, index) => (
				<div
					className="flex items-start justify-between gap-3 text-sm"
					key={item.value}
				>
					<div className="flex min-w-0 items-start gap-2">
						<span
							className="mt-1 size-2.5 shrink-0 rounded-full"
							style={{ backgroundColor: getBreakdownColor(index) }}
						/>
						<div className="min-w-0">
							<p className="truncate font-medium">{item.label}</p>
							<p className="text-xs text-muted-foreground">
								{item.percentage.toFixed(0)}% da receita recebida
							</p>
						</div>
					</div>
					<span className="shrink-0 text-muted-foreground">
						{item.formattedTotal}
					</span>
				</div>
			))}
		</div>
	);
}

function BreakdownBarChart({
	items,
}: Pick<DashboardBreakdownChartProps, "items">) {
	return (
		<ChartContainer config={barChartConfig} className="h-[280px] w-full">
			<BarChart
				accessibilityLayer
				data={items}
				layout="vertical"
				margin={{ left: 12, right: 24 }}
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

function BreakdownDonutChart({
	items,
}: Pick<DashboardBreakdownChartProps, "items">) {
	const chartConfig = buildDonutChartConfig(items);

	return (
		<ChartContainer config={chartConfig} className="h-70 w-full">
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
				<ChartLegend content={<ChartLegendContent nameKey="value" />} />
				<Pie
					data={items}
					dataKey="total"
					nameKey="value"
					cx="50%"
					cy="44%"
					innerRadius={56}
					outerRadius={88}
					paddingAngle={2}
					strokeWidth={0}
				>
					{items.map((item, index) => (
						<Cell key={item.value} fill={getBreakdownColor(index)} />
					))}
				</Pie>
			</PieChart>
		</ChartContainer>
	);
}

export function DashboardBreakdownChart({
	title,
	items,
	emptyLabel,
	variant,
}: DashboardBreakdownChartProps) {
	return (
		<Card className="min-h-64">
			<CardHeader className="pb-3">
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3 pt-0">
				{items.length === 0 ? (
					<p className="text-sm text-muted-foreground">{emptyLabel}</p>
				) : (
					<>
						{variant === "bar" ? (
							<BreakdownBarChart items={items} />
						) : (
							<BreakdownDonutChart items={items} />
						)}
						{renderBreakdownList(items)}
					</>
				)}
			</CardContent>
		</Card>
	);
}
