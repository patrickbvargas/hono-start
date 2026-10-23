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
}

export function DashboardMetricCards({ metrics }: DashboardMetricCardsProps) {
	return (
		<div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 2xl:grid-cols-5">
			{metrics.map((metric) => (
				<Card key={metric.label} className="gap-2">
					<CardHeader>
						<div className="flex items-center gap-2">
							<p className="text-sm text-muted-foreground">{metric.label}</p>
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
									<TooltipContent>{metric.description}</TooltipContent>
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
												className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
											/>
										}
									>
										<Badge
											variant="secondary"
											className={cn(
												METRIC_BADGE_TONE_CLASSES[
													getChangeTone(metric.changePercent)
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
											{metric.previousLabel}: {metric.formattedPreviousValue}
										</p>
										<p>{metric.previousPeriodLabel}</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</CardAction>
					</CardHeader>
					<CardContent className="flex flex-col gap-2 pt-0">
						<p className="text-2xl font-semibold">{metric.formattedValue}</p>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
