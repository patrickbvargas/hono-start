import { useNavigate } from "@tanstack/react-router";
import { useOverlay } from "@/shared/hooks/use-overlay";
import { auditLogSearchSchema } from "../schemas/search";
import { useAuditHistoryData } from "./use-data";
export function useEntityHistory(entityType: string, entityId: number) {
	const navigate = useNavigate();
	const search = auditLogSearchSchema.parse({
		entityType: [entityType],
		entityId,
		page: 1,
		limit: 25,
		column: "occurredAt",
		direction: "desc",
	});
	const query = useAuditHistoryData({ entityType, entityId });
	const { overlay } = useOverlay<number>();
	const openPage = (id: number) => {
		void navigate({
			to: "/auditoria/$auditLogId",
			params: { auditLogId: String(id) },
			search: { tab: "overview", returnTo: search },
		});
	};
	return { ...query, openPage, details: overlay.details };
}
