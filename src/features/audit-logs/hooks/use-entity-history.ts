import { useState } from "react";
import { useOverlay } from "@/shared/hooks/use-overlay";
import { auditLogSearchSchema } from "../schemas/search";
import { useAuditHistoryData } from "./use-data";
export function useEntityHistory(entityType: string, entityId: number) {
	const [page, setPage] = useState(1);
	const limit = 10;
	const search = auditLogSearchSchema.parse({
		entityType: [entityType],
		entityId,
		page,
		limit,
		column: "occurredAt",
		direction: "desc",
	});
	const query = useAuditHistoryData(search);
	const { overlay } = useOverlay<number>();
	return { ...query, page, setPage, limit, details: overlay.details };
}
