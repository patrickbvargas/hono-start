import type { AuditLogSearch } from "../schemas/search";

export const auditLogSearchDefaults: AuditLogSearch = {
	page: 1,
	limit: 25,
	column: "occurredAt",
	direction: "asc",
	query: "",
	action: [],
	entityType: [],
	actorName: [],
};
