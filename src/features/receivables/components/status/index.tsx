import { Badge } from "@/shared/components/ui";
import { RECEIVABLE_STATES } from "../../constants/values";
import type { ReceivableSummary } from "../../schemas/model";

interface ReceivableStatusProps {
	receivable: ReceivableSummary;
}
export function ReceivableStatus({ receivable }: ReceivableStatusProps) {
	return (
		<span className="inline-flex flex-wrap gap-1">
			<Badge
				variant={receivable.situation === "overdue" ? "destructive" : "outline"}
			>
				{
					RECEIVABLE_STATES.find((item) => item.value === receivable.situation)
						?.label
				}
			</Badge>
			{receivable.isPartial && receivable.situation === "overdue" ? (
				<Badge variant="outline">Parcial</Badge>
			) : null}
		</span>
	);
}
