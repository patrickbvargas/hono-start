import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	ScrollArea,
	Skeleton,
} from "@/shared/components/ui";
import {
	Wrapper,
	WrapperBody,
	WrapperHeader,
} from "@/shared/components/wrapper";

const metricCardKeys = [
	"dashboard-pending-metric-1",
	"dashboard-pending-metric-2",
	"dashboard-pending-metric-3",
];

const tableColumnKeys = [
	"dashboard-pending-column-1",
	"dashboard-pending-column-2",
	"dashboard-pending-column-3",
	"dashboard-pending-column-4",
	"dashboard-pending-column-5",
];

const tableRowKeys = [
	"dashboard-pending-row-1",
	"dashboard-pending-row-2",
	"dashboard-pending-row-3",
	"dashboard-pending-row-4",
];

const breakdownItemKeys = [
	"dashboard-pending-breakdown-1",
	"dashboard-pending-breakdown-2",
	"dashboard-pending-breakdown-3",
	"dashboard-pending-breakdown-4",
];

function DashboardMetricCardSkeleton() {
	return (
		<Card
			data-testid="dashboard-pending-metric-card"
			aria-hidden="true"
			className="gap-2"
		>
			<CardHeader className="flex items-center justify-between">
				<Skeleton className="h-5 w-32" />
				<CardAction>
					<Skeleton className="h-5 w-14" />
				</CardAction>
			</CardHeader>
			<CardContent className="flex flex-col gap-2 pt-0">
				<Skeleton className="h-8 w-36" />
				<div className="flex items-center gap-1.5">
					<Skeleton className="h-5 w-48" />
					<Skeleton className="size-4 rounded-full" />
				</div>
			</CardContent>
		</Card>
	);
}

function DashboardBreakdownCardSkeleton() {
	return (
		<Card
			data-testid="dashboard-pending-breakdown-card"
			className="min-h-64"
			aria-hidden="true"
		>
			<CardHeader className="pb-3">
				<Skeleton className="h-6 w-36" />
			</CardHeader>
			<CardContent className="space-y-3 pt-0">
				<div className="flex h-70 items-end gap-4 rounded-lg px-4 pb-6">
					<Skeleton className="h-40 w-full rounded-md" />
					<Skeleton className="h-52 w-full rounded-md" />
					<Skeleton className="h-32 w-full rounded-md" />
					<Skeleton className="h-60 w-full rounded-md" />
				</div>
				<div className="space-y-2.5 border-t border-border/60 pt-3">
					{breakdownItemKeys.map((itemKey) => (
						<div
							key={itemKey}
							className="flex items-start justify-between gap-3"
						>
							<div className="flex min-w-0 items-start gap-2">
								<Skeleton className="mt-1 size-2.5 rounded-full" />
								<div className="space-y-1.5">
									<Skeleton className="h-4 w-28" />
									<Skeleton className="h-3 w-10" />
								</div>
							</div>
							<Skeleton className="h-4 w-16" />
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

export function DashboardPendingSkeleton() {
	return (
		<Wrapper title="Dashboard">
			<WrapperHeader className="justify-start gap-3">
				<Skeleton className="h-8 w-full max-w-80 rounded-md" />
				<div className="flex flex-wrap items-center gap-3">
					<Skeleton className="h-8 w-10 rounded-md" />
					<Skeleton className="h-8 w-12 rounded-md" />
					<Skeleton className="h-8 w-14 rounded-md" />
				</div>
				<Skeleton className="h-8 w-20 rounded-md" />
			</WrapperHeader>
			<WrapperBody>
				<ScrollArea className="h-full min-h-0">
					<div
						data-testid="dashboard-pending-skeleton"
						className="flex flex-col gap-4 p-0.5 pr-3"
					>
						<div
							data-testid="dashboard-pending-metrics"
							className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
						>
							{metricCardKeys.map((cardKey) => (
								<DashboardMetricCardSkeleton key={cardKey} />
							))}
						</div>
						<Card
							data-testid="dashboard-pending-financial-evolution"
							className="h-80"
							aria-hidden="true"
						>
							<CardHeader>
								<Skeleton className="h-6 w-40" />
								<Skeleton className="h-4 w-48" />
							</CardHeader>
							<CardContent className="flex min-h-0 flex-1 flex-col gap-3">
								<div className="flex h-80 items-end gap-3 rounded-lg px-4 pb-8">
									<Skeleton className="h-32 w-full rounded-md" />
									<Skeleton className="h-52 w-full rounded-md" />
									<Skeleton className="h-40 w-full rounded-md" />
									<Skeleton className="h-64 w-full rounded-md" />
									<Skeleton className="h-48 w-full rounded-md" />
									<Skeleton className="h-56 w-full rounded-md" />
								</div>
							</CardContent>
						</Card>
						<Card
							data-testid="dashboard-pending-remuneration-table"
							className="h-80"
							aria-hidden="true"
						>
							<CardHeader>
								<Skeleton className="h-6 w-32" />
							</CardHeader>
							<CardContent className="flex min-h-0 flex-1 flex-col pt-0">
								<div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg">
									<div className="grid grid-cols-[minmax(14rem,1.2fr)_repeat(4,minmax(7rem,1fr))_minmax(9rem,1fr)] gap-4 px-4 py-3">
										{tableColumnKeys.map((columnKey, index) => (
											<Skeleton
												key={columnKey}
												className={
													index === 0 ? "h-4 w-24" : "h-4 w-16 justify-self-end"
												}
											/>
										))}
									</div>
									<div className="flex min-h-0 flex-1 flex-col">
										{tableRowKeys.map((rowKey) => (
											<div
												key={rowKey}
												className="grid grid-cols-[minmax(14rem,1.2fr)_repeat(4,minmax(7rem,1fr))_minmax(9rem,1fr)] gap-4 px-4 py-3"
											>
												<Skeleton className="h-4 w-36" />
												<Skeleton className="h-4 w-16 justify-self-end" />
												<Skeleton className="h-4 w-16 justify-self-end" />
												<Skeleton className="h-4 w-16 justify-self-end" />
												<Skeleton className="h-4 w-16 justify-self-end" />
												<Skeleton className="h-4 w-20 justify-self-end" />
											</div>
										))}
									</div>
								</div>
							</CardContent>
						</Card>
						<div
							data-testid="dashboard-pending-breakdowns"
							className="grid gap-3 xl:grid-cols-2"
						>
							<DashboardBreakdownCardSkeleton />
							<DashboardBreakdownCardSkeleton />
						</div>
					</div>
				</ScrollArea>
			</WrapperBody>
		</Wrapper>
	);
}
