import {
	BadgeDollarSignIcon,
	InfoIcon,
	LandmarkIcon,
	TrendingDownIcon,
	TrendingUpIcon,
	WalletMinimalIcon,
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
import type { DashboardSummary } from "../../schemas/model";

interface DashboardMetricCardsProps {
	metrics: DashboardSummary["metrics"];
}

function getMetricIcon(label: string) {
	if (label === "Saldo total") {
		return <LandmarkIcon key={label} className="size-4" />;
	}

	if (label === "Receita prevista") {
		return <BadgeDollarSignIcon key={label} className="size-4" />;
	}

	if (label === "Receita recebida") {
		return <TrendingUpIcon key={label} className="size-4" />;
	}

	if (label === "Remunerações") {
		return <WalletMinimalIcon key={label} className="size-4" />;
	}

	return <BadgeDollarSignIcon key={label} className="size-4" />;
}

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

export function DashboardMetricCards({ metrics }: DashboardMetricCardsProps) {
	return (
		<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
			{metrics.map((metric) => (
				<Card key={metric.label} className="gap-2">
					<CardHeader>
						<div className="flex items-center gap-2">
							{getMetricIcon(metric.label)}
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
						<CardAction className={toneClassNames[metric.tone]}>
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
						</CardAction>
					</CardHeader>
					<CardContent className="flex flex-col gap-2 pt-0">
						<p className="text-2xl font-semibold">{metric.formattedValue}</p>
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
												className="sr-only md:not-sr-only inline-flex text-muted-foreground transition-colors hover:text-foreground"
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
					</CardContent>
				</Card>
			))}
		</div>
	);
}
