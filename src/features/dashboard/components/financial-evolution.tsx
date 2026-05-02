import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
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

interface FinancialEvolutionChartProps {
	description: string;
	items: DashboardSummary["financialEvolution"];
}

const chartConfig = {
	revenue: {
		label: "Receita",
		color: "var(--chart-1)",
	},
	remuneration: {
		label: "Remuneração",
		color: "var(--chart-2)",
	},
} satisfies ChartConfig;

function formatMonthLabel(value: string) {
	const [year, month] = value.split("-");

	if (!year || !month) {
		return value;
	}

	const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1));

	return new Intl.DateTimeFormat("pt-BR", {
		month: "short",
		year: "2-digit",
		timeZone: "UTC",
	})
		.format(date)
		.replace(".", "")
		.replace(" de ", "/");
}

function formatAxisCurrency(value: number) {
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

export function FinancialEvolutionChart({
	description,
	items,
}: FinancialEvolutionChartProps) {
	const hasValues = items.some((item) => {
		return item.revenue > 0 || item.remuneration > 0;
	});

	return (
		<Card className="min-h-96">
			<CardHeader>
				<CardTitle>Evolução financeira</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				<ChartContainer config={chartConfig} className="h-[320px] w-full">
					<BarChart accessibilityLayer data={items} barGap={8}>
						<CartesianGrid horizontal={false} vertical={false} />
						<XAxis
							dataKey="month"
							axisLine={false}
							tickLine={false}
							tickMargin={10}
							minTickGap={24}
							tickFormatter={formatMonthLabel}
						/>
						<YAxis
							axisLine={false}
							hide
							tickLine={false}
							tickMargin={10}
							width={96}
							tickFormatter={formatAxisCurrency}
						/>
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
						<ChartLegend content={<ChartLegendContent />} />
						<Bar
							dataKey="revenue"
							fill="var(--color-revenue)"
							radius={[4, 4, 0, 0]}
						/>
						<Bar
							dataKey="remuneration"
							fill="var(--color-remuneration)"
							radius={[4, 4, 0, 0]}
						/>
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
