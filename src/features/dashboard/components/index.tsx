import {
	BadgeDollarSignIcon,
	InfoIcon,
	ScaleIcon,
	TrendingDownIcon,
	TrendingUpIcon,
} from "lucide-react";
import {
	Badge,
	Card,
	CardAction,
	CardContent,
	CardHeader,
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import type { DashboardSummary } from "../schemas/model";
import { DashboardBreakdownChart } from "./breakdown-chart";
import { FinancialEvolutionChart } from "./financial-evolution";
import { DashboardRemunerationTable } from "./remuneration-table";

interface DashboardProps {
	data: DashboardSummary;
}

const metricIcons = [
	<BadgeDollarSignIcon key="revenue-total" className="size-4" />,
	<TrendingUpIcon key="revenue-received" className="size-4" />,
	<ScaleIcon key="remunerations" className="size-4" />,
];

const toneClassNames = {
	default: "text-foreground",
	success: "text-emerald-600 dark:text-emerald-400",
	warning: "text-amber-600 dark:text-amber-400",
	danger: "text-destructive",
};

const badgeToneClassNames = {
	default: "bg-secondary text-secondary-foreground",
	success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
	warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
	danger: "bg-destructive/10 text-destructive",
};

function formatChange(value: number) {
	const prefix = value > 0 ? "+" : "";
	return `${prefix}${value.toFixed(0)}%`;
}

function getChangeTone(value: number) {
	if (value > 0) {
		return "success" as const;
	}

	if (value < 0) {
		return "danger" as const;
	}

	return "default" as const;
}

export function Dashboard({ data }: DashboardProps) {
	return (
		<div className="h-full overflow-auto pb-4">
			<div className="flex flex-col gap-4">
				<div className="flex justify-end">
					<Badge variant={data.isAdmin ? "default" : "secondary"}>
						{data.scopeLabel}
					</Badge>
				</div>

				<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
					{data.metrics.map((metric, index) => (
						<Card key={metric.label}>
							<CardHeader className="gap-0.5 pb-1.5">
								<div className="space-y-0.5">
									<p className="text-sm text-muted-foreground">
										{metric.label}
									</p>
									<p className="text-2xl font-semibold">
										{metric.formattedValue}
									</p>
								</div>
								<CardAction className={toneClassNames[metric.tone]}>
									{metricIcons[index]}
								</CardAction>
							</CardHeader>
							<CardContent className="flex flex-col gap-2 pt-0">
								<div className="flex items-center justify-between gap-3">
									<Badge
										variant="secondary"
										className={cn(
											badgeToneClassNames[getChangeTone(metric.changePercent)],
										)}
									>
										{metric.changePercent < 0 ? (
											<TrendingDownIcon className="size-3.5" />
										) : (
											<TrendingUpIcon className="size-3.5" />
										)}
										{formatChange(metric.changePercent)}
									</Badge>
									<div className="flex items-center gap-1.5 text-right text-sm text-muted-foreground">
										<p>
											{metric.previousLabel}: {metric.formattedPreviousValue}
										</p>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger
													render={
														<button
															type="button"
															className="inline-flex text-muted-foreground transition-colors hover:text-foreground"
														/>
													}
												>
													<InfoIcon className="size-3.5" />
												</TooltipTrigger>
												<TooltipContent>
													Refere-se a {metric.previousPeriodLabel}.
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
								</div>
								<p className="text-sm text-muted-foreground">
									{metric.description}
								</p>
							</CardContent>
						</Card>
					))}
				</div>

				<FinancialEvolutionChart
					description={data.financialEvolutionLabel}
					items={data.financialEvolution}
				/>

				<DashboardRemunerationTable
					months={data.remunerationMonths}
					rows={data.remunerationTable}
				/>

				<div className="grid gap-3 xl:grid-cols-2">
					<DashboardBreakdownChart
						title="Receita por área"
						items={data.legalAreaRevenue}
						emptyLabel="Nenhuma receita recebida por área."
						variant="bar"
					/>
					<DashboardBreakdownChart
						title="Receita por tipo"
						items={data.revenueTypeRevenue}
						emptyLabel="Nenhuma receita recebida por tipo."
						variant="donut"
					/>
				</div>
			</div>
		</div>
	);
}
