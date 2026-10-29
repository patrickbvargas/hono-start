import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
	ScrollArea,
} from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import type { DashboardBreakdownItem } from "../../schemas/model";
import { formatCompactCurrency } from "../../utils/format";
import { ChartHelp } from "../chart-help";
import { DrilldownBarShape } from "../drilldown/bar-shape";

interface RevenueRemunerationBreakdownChartProps {
	items: DashboardBreakdownItem[];
	title: string;
	dimension: "area" | "type";
	isAdmin: boolean;
	onSelect?: (
		item: DashboardBreakdownItem,
		series: "revenue" | "remuneration",
		trigger?: SVGElement,
	) => void;
}

export function RevenueRemunerationBreakdownChart({
	items,
	title,
	dimension,
	isAdmin,
	onSelect,
}: RevenueRemunerationBreakdownChartProps) {
	const grouping =
		dimension === "area" ? "por área do contrato" : "por tipo de honorário";
	const config = {
		total: { label: "Honorários recebidos", color: "var(--chart-1)" },
		remuneration: {
			label: isAdmin ? "Remunerações geradas" : "Minhas remunerações geradas",
			color: "var(--chart-4)",
		},
	};
	const hasValues = items.some(
		(item) => item.total !== 0 || (item.remuneration ?? 0) !== 0,
	);
	return (
		<Card className="min-w-0 h-80 min-h-80">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					{title}
					<ChartHelp
						title={title}
						description={
							isAdmin
								? `Honorários recebidos e remunerações geradas ${grouping}. Não inclui despesas nem confirma repasses.`
								: `Honorários recebidos nos contratos que você pode visualizar e remunerações geradas para você, ${grouping}. Honorários do contrato não são remuneração pessoal. Não confirma repasses.`
						}
					/>
				</CardTitle>
			</CardHeader>
			<CardContent className="flex min-h-0 flex-1 flex-col gap-3">
				<ScrollArea className="min-h-0 min-w-0 flex-1">
					<div className="h-full pb-5">
						<ChartContainer
							config={config}
							className="h-full min-h-0 w-full"
							style={{ minWidth: items.length * 132 + 48 }}
						>
							<BarChart
								accessibilityLayer
								data={items}
								barGap={8}
								margin={{ top: 24, bottom: 0, left: 24, right: 24 }}
							>
								<XAxis
									dataKey="label"
									axisLine={false}
									tickLine={false}
									tickMargin={10}
									height={40}
									minTickGap={24}
									interval={0}
									tick={{ width: 88, fontSize: 12 }}
								/>
								<YAxis hide axisLine={false} tickLine={false} />
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
								<ChartLegend
									itemSorter={(item) =>
										["total", "remuneration"].indexOf(String(item.dataKey))
									}
									content={<ChartLegendContent />}
								/>
								{(["total", "remuneration"] as const).map((series) => (
									<Bar
										key={series}
										dataKey={series}
										fill={`var(--color-${series})`}
										radius={4}
										shape={(props) => (
											<DrilldownBarShape
												{...props}
												label={`${config[series].label} ${items[props.index]?.label ?? ""}`}
												onActivate={
													onSelect && items[props.index]
														? (trigger) =>
																onSelect(
																	items[props.index],
																	series === "total"
																		? "revenue"
																		: "remuneration",
																	trigger,
																)
														: undefined
												}
											/>
										)}
									>
										<LabelList
											dataKey={series}
											position="top"
											offset={8}
											className="fill-muted-foreground text-xs"
											formatter={(value) =>
												formatCompactCurrency(Number(value))
											}
										/>
									</Bar>
								))}
							</BarChart>
						</ChartContainer>
					</div>
				</ScrollArea>
				{hasValues ? null : (
					<p className="text-sm text-muted-foreground">
						Nenhum valor encontrado para os filtros selecionados.
					</p>
				)}
			</CardContent>
		</Card>
	);
}
