import type { EntityId } from "@/shared/schemas/entity";
import { pendingWorkSearchSchema } from "../schemas/search";
import { usePendingWorkPreviewData } from "./use-data";

interface UseRelatedContractAlertsOptions {
	kind: "client" | "employee";
	id: EntityId;
}

export function useRelatedContractAlerts({
	kind,
	id,
}: UseRelatedContractAlertsOptions) {
	const search = pendingWorkSearchSchema.parse({
		clientId: kind === "client" ? String(id) : "",
		employeeId: kind === "employee" ? String(id) : "",
		limit: 5,
	});
	const query = usePendingWorkPreviewData(search);
	return { ...query, collectionSearch: { ...search, limit: 25, page: 1 } };
}
