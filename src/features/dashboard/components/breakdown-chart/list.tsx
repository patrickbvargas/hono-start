import type { DashboardBreakdownItem } from "../../schemas/model";
import { getBreakdownColor } from "../../utils/breakdown";

interface BreakdownItemsProps {
	items: DashboardBreakdownItem[];
}

export function BreakdownList({ items }: BreakdownItemsProps) {
	return (
		<div className="sr-only sm:not-sr-only space-y-2.5">
			{items.map((item, index) => (
				<div
					className="flex items-start justify-between gap-3 text-sm"
					key={item.value}
				>
					<div className="flex min-w-0 items-start gap-2">
						<span
							className="mt-1 size-2.5 shrink-0 rounded-full"
							style={{ backgroundColor: getBreakdownColor(index) }}
						/>
						<div className="min-w-0">
							<p className="truncate font-medium">{item.label}</p>
							<p className="text-xs text-muted-foreground">
								{item.percentage.toFixed(0)}%
							</p>
						</div>
					</div>
					<span className="shrink-0 text-muted-foreground">
						{item.formattedTotal}
					</span>
				</div>
			))}
		</div>
	);
}
