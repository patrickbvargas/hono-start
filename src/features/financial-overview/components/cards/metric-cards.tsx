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
import { SensitiveValue } from "@/shared/components/value-visibility";
import { cn } from "@/shared/lib/utils";
import {
	FINANCIAL_METRIC_BADGE_TONE_CLASSES,
	FINANCIAL_METRIC_TONE_CLASSES,
} from "../../constants/metrics";
import type { FinancialOverviewMetric } from "../../schemas/model";
import { formatChange, getChangeTone } from "../../utils/metrics";

interface FinancialMetricCardsProps {
	metrics: FinancialOverviewMetric[];
}

export function FinancialMetricCards({ metrics }: FinancialMetricCardsProps) {
	return (
		<div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
			{metrics.map((metric) => (
				<Card key={metric.label} className="relative min-w-0 gap-2">
					<CardHeader className="pointer-events-none relative">
						<div className="flex min-w-0 items-center gap-2">
							<p
								className="truncate text-sm text-muted-foreground"
								title={metric.label}
							>
								{metric.label}
							</p>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger
										className="max-md:hidden [@media(hover:none)]:hidden"
										render={
											<button
												type="button"
												aria-label={`Sobre ${metric.label}`}
												className="pointer-events-auto inline-flex shrink-0 text-muted-foreground transition-colors hover:text-foreground"
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
						<CardAction className={FINANCIAL_METRIC_TONE_CLASSES[metric.tone]}>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger
										className="max-md:hidden [@media(hover:none)]:hidden"
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
												FINANCIAL_METRIC_BADGE_TONE_CLASSES[
													getChangeTone(
														metric.changePercent,
														metric.drilldown === "payables",
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
											<SensitiveValue>
												{metric.formattedPreviousValue}
											</SensitiveValue>
										</p>
										<p>{metric.previousPeriodLabel}</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</CardAction>
					</CardHeader>
					<CardContent className="pointer-events-none relative flex flex-col gap-2 pt-0">
						<p className="text-2xl font-semibold">
							<SensitiveValue>{metric.formattedValue}</SensitiveValue>
						</p>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
