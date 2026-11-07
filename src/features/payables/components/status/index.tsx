import { Badge } from "@/shared/components/ui";
import { PAYABLE_STATES } from "../../constants/values";
import type { PayableSummary } from "../../schemas/model";

interface PayableStatusProps {
	payable: PayableSummary;
}
export function PayableStatus({ payable }: PayableStatusProps) {
	return (
		<span className="inline-flex flex-wrap gap-1">
			<Badge
				variant={payable.situation === "overdue" ? "destructive" : "outline"}
			>
				{PAYABLE_STATES.find((item) => item.value === payable.situation)?.label}
			</Badge>
			{payable.isPartial && payable.situation === "overdue" ? (
				<Badge variant="outline">Parcial</Badge>
			) : null}
		</span>
	);
}
