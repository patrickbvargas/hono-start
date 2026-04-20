export const REMUNERATION_ERRORS = {
	REMUNERATION_CREATE_FORBIDDEN:
		"Apenas administradores podem criar remunerações",
	REMUNERATION_DELETE_FORBIDDEN:
		"Apenas administradores podem excluir remunerações",
	REMUNERATION_DELETE_FAILED: "Erro ao excluir remuneração",
	REMUNERATION_NOT_FOUND: "Remuneração não encontrada",
	REMUNERATION_RESTORE_FORBIDDEN:
		"Apenas administradores podem restaurar remunerações",
	REMUNERATION_RESTORE_FAILED: "Erro ao restaurar remuneração",
	REMUNERATION_UPDATE_FORBIDDEN:
		"Apenas administradores podem editar remunerações",
	REMUNERATION_UPDATE_FAILED: "Erro ao atualizar remuneração",
	REMUNERATION_EXPORT_FAILED: "Erro ao exportar remunerações",
	REMUNERATION_AMOUNT_TOO_LOW: "Valor deve ser maior que zero",
	REMUNERATION_PERCENTAGE_TOO_LOW: "Percentual não pode ser negativo",
	REMUNERATION_PERCENTAGE_TOO_HIGH: "Percentual deve ser menor ou igual a 100%",
	REMUNERATION_EDIT_DELETED: "Não é possível editar uma remuneração excluída",
	REMUNERATION_EDIT_PARENT_DELETED:
		"Não é possível editar uma remuneração vinculada a um honorário excluído",
	REMUNERATION_RESTORE_PARENT_DELETED:
		"Não é possível restaurar a remuneração enquanto o honorário de origem estiver excluído",
	REMUNERATION_GET_FAILED: "Erro ao buscar remunerações",
	REMUNERATION_DETAIL_NOT_FOUND: "Remuneração não encontrada",
	REMUNERATION_DETAIL_FAILED: "Erro ao buscar remuneração",
	REMUNERATION_SELECTABLE_CONTRACTS_FAILED:
		"Erro ao buscar contratos disponíveis",
	REMUNERATION_SELECTABLE_EMPLOYEES_FAILED:
		"Erro ao buscar colaboradores disponíveis",
} as const;
