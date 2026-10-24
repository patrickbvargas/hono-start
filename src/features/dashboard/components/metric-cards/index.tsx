import { InfoIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
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
import {
	METRIC_BADGE_TONE_CLASSES,
	METRIC_TONE_CLASSES,
} from "../../constants/metrics";
import type { DashboardMetric } from "../../schemas/model";
import { formatChange, getChangeTone } from "../../utils/metrics";

interface DashboardMetricCardsProps {
	metrics: DashboardMetric[];
	onSelect?: (metric: DashboardMetric, trigger: HTMLElement) => void;
}

export function DashboardMetricCards({
	metrics,
	onSelect,
}: DashboardMetricCardsProps) {
	return (
		<div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 2xl:grid-cols-5">
			{metrics.map((metric) => (
				<Card key={metric.label} className="relative gap-2">
					{onSelect && metric.drilldown ? (
						<button
							type="button"
							aria-label={`Detalhar ${metric.label}`}
							title={`Ver detalhes: ${metric.label}`}
							className="absolute inset-0 cursor-pointer rounded-xl transition-[background-color,box-shadow] hover:bg-accent/30 hover:ring-2 hover:ring-ring/60 focus-visible:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							onClick={(event) => onSelect(metric, event.currentTarget)}
						/>
					) : null}
					<CardHeader className="pointer-events-none relative">
						<div className="flex items-center gap-2">
							<p className="text-sm text-muted-foreground">{metric.label}</p>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger
										render={
											<button
												type="button"
												aria-label={`Sobre ${metric.label}`}
												className="pointer-events-auto inline-flex text-muted-foreground transition-colors hover:text-foreground"
											/>
										}
									>
										<InfoIcon className="size-3.5" />
									</TooltipTrigger>
									<TooltipContent>
										{metric.description.replaceAll(". ", ".\n")}
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
						<CardAction className={METRIC_TONE_CLASSES[metric.tone]}>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger
										render={
											<button
												type="button"
												aria-label={`Comparação de ${metric.label}`}
												className="pointer-events-auto rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
											/>
										}
									>
										<Badge
											variant="secondary"
											className={cn(
												METRIC_BADGE_TONE_CLASSES[
													getChangeTone(
														metric.changePercent,
														metric.drilldown === "expense",
													)
												],
											)}
										>
											{metric.changePercent !== null &&
											metric.changePercent < 0 ? (
												<TrendingDownIcon className="size-3.5" />
											) : (
												<TrendingUpIcon className="size-3.5" />
											)}
											{formatChange(metric.changePercent)}
										</Badge>
									</TooltipTrigger>
									<TooltipContent>
										<p>
											{metric.previousLabel}
											{"\n"}
											{metric.formattedPreviousValue}
										</p>
										<p>{metric.previousPeriodLabel}</p>
										{metric.drilldown === "expense" &&
										metric.changePercent !== null ? (
											<p>
												{metric.changePercent > 0
													? "Aumento de despesas"
													: metric.changePercent < 0
														? "Redução de despesas"
														: "Despesas estáveis"}
											</p>
										) : null}
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</CardAction>
					</CardHeader>
					<CardContent className="pointer-events-none relative flex flex-col gap-2 pt-0">
						<p className="text-2xl font-semibold">{metric.formattedValue}</p>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
