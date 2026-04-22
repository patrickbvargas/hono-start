import {
	ActivityIcon,
	BadgeDollarSignIcon,
	BriefcaseBusinessIcon,
	ScaleIcon,
	TrendingDownIcon,
	TrendingUpIcon,
	UsersIcon,
} from "lucide-react";
import { Card, Chip } from "@/shared/components/Hui";
import type { DashboardSummary } from "../schemas/model";

interface DashboardProps {
	data: DashboardSummary;
}

const metricIcons = [
	<BadgeDollarSignIcon key="revenue-total" className="size-4" />,
	<TrendingUpIcon key="revenue-received" className="size-4" />,
	<ScaleIcon key="remunerations" className="size-4" />,
	<BriefcaseBusinessIcon key="contracts" className="size-4" />,
];

const toneClassNames = {
	default: "text-foreground",
	success: "text-success",
	warning: "text-warning",
	danger: "text-danger",
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

function DashboardBreakdown({
	title,
	items,
	emptyLabel,
}: {
	title: string;
	items: DashboardSummary["legalAreaRevenue"];
	emptyLabel: string;
}) {
	return (
		<Card className="min-h-72">
			<Card.Header>
				<Card.Title>{title}</Card.Title>
			</Card.Header>
			<Card.Content className="space-y-4">
				{items.length === 0 ? (
					<p className="text-sm text-muted">{emptyLabel}</p>
				) : (
					items.map((item) => (
						<div className="space-y-2" key={item.value}>
							<div className="flex items-center justify-between gap-3 text-sm">
								<span className="min-w-0 truncate font-medium">
									{item.label}
								</span>
								<span className="shrink-0 text-muted">
									{item.formattedTotal}
								</span>
							</div>
							<div className="h-2 overflow-hidden rounded-full bg-surface-tertiary">
								<div
									className="h-full rounded-full bg-accent"
									style={{ width: `${Math.max(item.percentage, 2)}%` }}
								/>
							</div>
							<p className="text-xs text-muted">
								{item.percentage.toFixed(0)}% da receita recebida
							</p>
						</div>
					))
				)}
			</Card.Content>
		</Card>
	);
}

export function Dashboard({ data }: DashboardProps) {
	return (
		<div className="h-full overflow-auto pb-4">
			<div className="flex flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<p className="text-sm text-muted">
							Resumo operacional e financeiro
						</p>
						<h2 className="text-2xl font-semibold">Dashboard</h2>
					</div>
					<Chip color={data.isAdmin ? "accent" : "default"} variant="soft">
						{data.scopeLabel}
					</Chip>
				</div>

				<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
					{data.metrics.map((metric, index) => (
						<Card key={metric.label}>
							<Card.Content className="flex min-h-36 flex-col justify-between gap-4">
								<div className="flex items-start justify-between gap-3">
									<div>
										<p className="text-sm text-muted">{metric.label}</p>
										<p className="mt-2 text-2xl font-semibold">
											{metric.formattedValue}
										</p>
									</div>
									<span className={toneClassNames[metric.tone]}>
										{metricIcons[index]}
									</span>
								</div>
								<p className="text-sm text-muted">{metric.description}</p>
							</Card.Content>
						</Card>
					))}
				</div>

				<div className="grid gap-3 lg:grid-cols-2">
					{data.comparisons.map((comparison) => {
						const tone = getChangeTone(comparison.changePercent);
						const TrendIcon =
							comparison.changePercent < 0 ? TrendingDownIcon : TrendingUpIcon;

						return (
							<Card key={comparison.label}>
								<Card.Content className="flex min-h-40 flex-col justify-between gap-4">
									<div className="flex items-start justify-between gap-3">
										<div>
											<p className="text-sm text-muted">{comparison.label}</p>
											<p className="mt-2 text-3xl font-semibold">
												{comparison.formattedCurrentValue}
											</p>
										</div>
										<Chip color={tone} variant="soft">
											<TrendIcon className="size-3.5" />
											{formatChange(comparison.changePercent)}
										</Chip>
									</div>
									<p className="text-sm text-muted">
										Mês anterior: {comparison.formattedPreviousValue}
									</p>
								</Card.Content>
							</Card>
						);
					})}
				</div>

				<div className="grid gap-3 xl:grid-cols-[1fr_1fr_1.15fr]">
					<DashboardBreakdown
						title="Receita por área"
						items={data.legalAreaRevenue}
						emptyLabel="Nenhuma receita recebida por área."
					/>
					<DashboardBreakdown
						title="Receita por tipo"
						items={data.revenueTypeRevenue}
						emptyLabel="Nenhuma receita recebida por tipo."
					/>
					<Card className="min-h-72">
						<Card.Header>
							<Card.Title>Atividade recente</Card.Title>
						</Card.Header>
						<Card.Content className="space-y-3">
							{data.recentActivity.length === 0 ? (
								<p className="text-sm text-muted">Nenhum evento recente.</p>
							) : (
								data.recentActivity.map((activity) => (
									<div
										className="flex items-start gap-3 rounded-md border border-border p-3"
										key={activity.id}
									>
										<span className="mt-0.5 rounded-md bg-surface-tertiary p-2 text-muted">
											<ActivityIcon className="size-4" />
										</span>
										<div className="min-w-0 flex-1">
											<div className="flex items-start justify-between gap-3">
												<p className="font-medium">{activity.label}</p>
												<span className="shrink-0 text-xs text-muted">
													{activity.formattedDate}
												</span>
											</div>
											<p className="truncate text-sm text-muted">
												{activity.description}
											</p>
											{activity.formattedAmount ? (
												<p className="mt-1 text-sm font-medium">
													{activity.formattedAmount}
												</p>
											) : null}
										</div>
									</div>
								))
							)}
						</Card.Content>
					</Card>
				</div>

				<div className="flex items-center gap-2 text-sm text-muted">
					<UsersIcon className="size-4" />
					<span>
						Dados calculados conforme escopo da sessão e registros ativos.
					</span>
				</div>
			</div>
		</div>
	);
}
