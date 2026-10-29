import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import { useDrilldownOverview } from "../../hooks/use-drilldown-overview";
import type {
	DashboardDrilldownRow,
	DashboardDrilldownSelection,
} from "../../schemas/drilldown";

interface DashboardDrilldownOverviewProps {
	rows: DashboardDrilldownRow[];
	selection: DashboardDrilldownSelection;
}

export function DashboardDrilldownOverview(
	props: DashboardDrilldownOverviewProps,
) {
	const blocks = useDrilldownOverview(props);
	if (!props.rows.length) {
		return (
			<p className="py-8 text-center text-sm text-muted-foreground">
				Nenhum registro encontrado.
			</p>
		);
	}
	return (
		<div className="grid grid-cols-1 gap-6 py-3 sm:grid-cols-2 lg:grid-cols-3">
			{blocks.map((block) => (
				<section
					key={block.key}
					aria-label={block.label}
					className="min-w-0 space-y-3"
				>
					<h3 className="border-l-2 border-primary pl-2 text-xs font-semibold uppercase">
						{block.label}
					</h3>
					<dl className="space-y-2 text-sm">
						{block.groups.map((group) => (
							<div
								key={group.key}
								className="flex items-start justify-between gap-4 pl-2"
							>
								<dt className="min-w-0 break-words">{group.label}</dt>
								<dd className="shrink-0 tabular-nums">
									<SensitiveValue>
										{formatter.currency(group.amount)}
									</SensitiveValue>
								</dd>
							</div>
						))}
					</dl>
				</section>
			))}
		</div>
	);
}
