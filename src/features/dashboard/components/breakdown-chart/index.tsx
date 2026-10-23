import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	// Separator,
} from "@/shared/components/ui";
import { CHART_HELP } from "../../constants/chart-help";
import type { DashboardBreakdownItem } from "../../schemas/model";
import { ChartHelp } from "../chart-help";
import { BreakdownBarChart } from "./bar";
import { BreakdownColumnChart } from "./column";
import { BreakdownDonutChart } from "./donut";

// import { BreakdownList } from "./list";

interface DashboardBreakdownChartProps {
	title: string;
	items: DashboardBreakdownItem[];
	onSelect?: (item: DashboardBreakdownItem, trigger?: SVGElement) => void;
	emptyLabel: string;
	variant: "bar" | "donut" | "column";
}

export function DashboardBreakdownChart({
	title,
	items,
	emptyLabel,
	variant,
	onSelect,
}: DashboardBreakdownChartProps) {
	const hasValues = items.some((item) => item.total !== 0);

	return (
		<Card className="min-h-85">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					{title}
					<ChartHelp
						title={title}
						description={
							CHART_HELP[title] ??
							"Valores consolidados para os filtros e período selecionados."
						}
					/>
				</CardTitle>
			</CardHeader>
			<CardContent className="flex min-h-0 flex-1 flex-col gap-3 pt-0">
				{!hasValues ? (
					<p className="text-sm text-muted-foreground">{emptyLabel}</p>
				) : (
					<>
						{variant === "bar" ? (
							<BreakdownBarChart items={items} onSelect={onSelect} />
						) : variant === "column" ? (
							<BreakdownColumnChart items={items} onSelect={onSelect} />
						) : (
							<BreakdownDonutChart items={items} />
						)}
						{/* <Separator className="hidden sm:block" />
                        <BreakdownList items={items} /> */}
					</>
				)}
			</CardContent>
		</Card>
	);
}
