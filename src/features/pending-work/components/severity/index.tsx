import { Badge } from "@/shared/components/ui";
import type { PendingWork } from "../../schemas/model";

interface PendingWorkSeverityProps {
	severity: PendingWork["severity"];
}

export function PendingWorkSeverity({ severity }: PendingWorkSeverityProps) {
	return (
		<Badge
			variant="outline"
			className={
				severity === "high"
					? "border-transparent bg-red-600/10 text-red-700 dark:text-red-400"
					: severity === "medium"
						? "border-transparent bg-amber-600/10 text-amber-800 dark:text-amber-400"
						: "border-transparent bg-blue-600/10 text-blue-700 dark:text-blue-400"
			}
		>
			{severity === "high" ? "Alta" : severity === "medium" ? "Média" : "Baixa"}
		</Badge>
	);
}
