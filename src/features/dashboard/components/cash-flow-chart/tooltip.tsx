import { formatter } from "@/shared/lib/formatter";
import type { DashboardCashFlowChartItem } from "../../schemas/model";
import { formatMonthLabel } from "../../utils/format";

interface CashFlowTooltipProps {
	active?: boolean;
	label?: string | number;
	payload?: Array<{ payload?: DashboardCashFlowChartItem }>;
}

export function CashFlowTooltip({
	active,
	label,
	payload,
}: CashFlowTooltipProps) {
	if (!active || !payload?.length || !payload[0]?.payload) {
		return null;
	}

	const item = payload[0].payload;

	return (
		<div className="grid min-w-48 gap-2 rounded-lg border border-border/60 bg-popover px-3 py-2 text-xs shadow-md">
			<div className="font-medium text-popover-foreground">
				{formatMonthLabel(String(label ?? item.month))}
			</div>
			<div className="grid gap-1.5">
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-2 text-muted-foreground">
						<span
							className="size-2.5 rounded-full"
							style={{ backgroundColor: "var(--chart-2)" }}
						/>
						<span>Entrada</span>
					</div>
					<span className="font-medium text-popover-foreground">
						{formatter.currency(item.entry)}
					</span>
				</div>
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-2 text-muted-foreground">
						<span
							className="size-2.5 rounded-full"
							style={{ backgroundColor: "var(--chart-4)" }}
						/>
						<span>Saída</span>
					</div>
					<span className="font-medium text-popover-foreground">
						{formatter.currency(item.output)}
					</span>
				</div>
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-2 text-muted-foreground">
						<span
							className="size-2.5 rounded-full"
							style={{
								backgroundColor:
									item.balance < 0 ? "var(--chart-5)" : "var(--chart-1)",
							}}
						/>
						<span>Saldo</span>
					</div>
					<span className="font-medium text-popover-foreground">
						{formatter.currency(item.balance)}
					</span>
				</div>
			</div>
		</div>
	);
}
