const ENTITY_TYPE_LABELS: Record<string, string> = {
	Attachment: "Anexo",
	Client: "Cliente",
	Contract: "Contrato",
	Employee: "Colaborador",
	Fee: "Honorário",
	Remuneration: "Remuneração",
	Revenue: "Receita",
};

const ACTION_LABELS: Record<string, string> = {
	CREATE: "criou",
	UPDATE: "atualizou",
	DELETE: "removeu",
	RESTORE: "restaurou",
};

const SPECIAL_DESCRIPTION_LABELS: Record<string, string> = {
	GRANT_ACCESS: "liberou acesso ao sistema",
	REVOKE_ACCESS: "revogou acesso ao sistema",
	RESET_PASSWORD: "redefiniu a senha",
};

export function getAuditEntityTypeLabel(entityType: string) {
	return ENTITY_TYPE_LABELS[entityType] ?? entityType;
}

function normalizeEntityName(entityName: string) {
	return entityName.trim() || "registro";
}

export function getAuditDescription(params: {
	action: string;
	entityType: string;
	entityName: string;
	changeData: unknown;
	fallbackDescription: string;
}) {
	const isSystemEvent =
		params.entityType.trim() === "" && params.entityName.trim() === "";
	const entityTypeLabel = isSystemEvent
		? "sistema"
		: getAuditEntityTypeLabel(params.entityType).toLowerCase();
	const entityName = isSystemEvent
		? "sistema"
		: normalizeEntityName(params.entityName);

	if (
		params.changeData &&
		typeof params.changeData === "object" &&
		"action" in params.changeData &&
		typeof params.changeData.action === "string"
	) {
		const specialAction = SPECIAL_DESCRIPTION_LABELS[params.changeData.action];
		if (specialAction) {
			return isSystemEvent
				? `${specialAction}.`
				: `${specialAction} de ${entityTypeLabel} ${entityName}.`;
		}
	}

	const actionLabel = ACTION_LABELS[params.action];
	if (actionLabel) {
		return isSystemEvent
			? `${actionLabel} ${entityTypeLabel}.`
			: `${actionLabel} ${entityTypeLabel} ${entityName}.`;
	}

	return params.fallbackDescription;
}
