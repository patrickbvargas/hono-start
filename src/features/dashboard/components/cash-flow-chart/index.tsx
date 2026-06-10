import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ReferenceLine,
	XAxis,
	YAxis,
} from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
} from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import type { DashboardSummary } from "../../schemas/model";

interface DashboardCashFlowChartProps {
	description: string;
	items: NonNullable<DashboardSummary["cashFlow"]>["chart"];
}

const chartConfig = {
	balance: {
		label: "Saldo",
		color: "var(--chart-1)",
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

function CashFlowTooltip({
	active,
	label,
	payload,
}: {
	active?: boolean;
	label?: string | number;
	payload?: Array<{
		payload?: DashboardCashFlowChartProps["items"][number];
	}>;
}) {
	if (!active || !payload?.length || !payload[0]?.payload) {
		return null;
	}

	const item = payload[0].payload;

	return (
		<div className="grid min-w-48 gap-2 rounded-lg border border-border/60 bg-popover px-3 py-2 text-xs shadow-md">
			<div className="font-medium text-popover-foreground">
				{formatMonthLabel(String(label ?? item.month))}
			</div>
			<div className="grid gap-1.5">
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-2 text-muted-foreground">
						<span
							className="size-2.5 rounded-full"
							style={{ backgroundColor: "var(--chart-2)" }}
						/>
						<span>Entrada</span>
					</div>
					<span className="font-medium text-popover-foreground">
						{formatter.currency(item.entry)}
					</span>
				</div>
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-2 text-muted-foreground">
						<span
							className="size-2.5 rounded-full"
							style={{ backgroundColor: "var(--chart-4)" }}
						/>
						<span>Saída</span>
					</div>
					<span className="font-medium text-popover-foreground">
						{formatter.currency(item.output)}
					</span>
				</div>
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-2 text-muted-foreground">
						<span
							className="size-2.5 rounded-full"
							style={{
								backgroundColor:
									item.balance < 0 ? "var(--chart-5)" : "var(--chart-1)",
							}}
						/>
						<span>Saldo</span>
					</div>
					<span className="font-medium text-popover-foreground">
						{formatter.currency(item.balance)}
					</span>
				</div>
			</div>
		</div>
	);
}

export function DashboardCashFlowChart({
	description,
	items,
}: DashboardCashFlowChartProps) {
	const hasValues = items.some((item) => item.balance !== 0);

	return (
		<Card className="h-80">
			<CardHeader>
				<CardTitle>Fluxo de caixa</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className="flex min-h-0 flex-1 flex-col gap-3">
				<ChartContainer config={chartConfig} className="h-80 w-full">
					<BarChart accessibilityLayer data={items} barGap={12}>
						<CartesianGrid horizontal={false} vertical={false} />
						<ReferenceLine y={0} stroke="var(--border)" />
						<XAxis
							dataKey="month"
							axisLine={false}
							tickLine={false}
							tickMargin={10}
							minTickGap={24}
							tickFormatter={formatMonthLabel}
						/>
						<YAxis axisLine={false} hide tickLine={false} />
						<ChartTooltip cursor={false} content={<CashFlowTooltip />} />
						<Bar dataKey="balance" radius={[4, 4, 4, 4]}>
							{items.map((item) => (
								<Cell
									key={item.month}
									fill={item.balance < 0 ? "var(--chart-5)" : "var(--chart-1)"}
								/>
							))}
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
