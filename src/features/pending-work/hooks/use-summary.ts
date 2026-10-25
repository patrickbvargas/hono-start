import { useFilter } from "@/shared/hooks/use-filter";
import { pendingWorkFilterSchema } from "../schemas/filter";
import type { PendingWork } from "../schemas/model";

export function usePendingWorkSummary() {
	const { filter, handleFilter } = useFilter(pendingWorkFilterSchema);
	return {
		handleSelectSeverity: (severity: PendingWork["severity"] | null) =>
			handleFilter({ ...filter, severity: severity ? [severity] : [] }),
	};
}
