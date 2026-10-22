export const EMPLOYEE_ERRORS = {
	MANAGE_FORBIDDEN: "Apenas administradores podem gerenciar colaboradores",
	CREATE_FORBIDDEN: "Você não tem permissão para criar colaboradores",
	CREATE_FAILED: "Erro ao criar colaborador",
	DELETE_FORBIDDEN: "Apenas administradores podem excluir colaboradores",
	DELETE_FAILED: "Erro ao excluir colaborador",
	DELETE_ACTIVE_DEPENDENCIES:
		"Não é possível excluir colaborador com remunerações ativas",
	NOT_FOUND: "colaborador não encontrado",
	GET_FAILED: "Erro ao buscar colaboradores",
	RESTORE_FORBIDDEN: "Apenas administradores podem restaurar colaboradores",
	RESTORE_FAILED: "Erro ao restaurar colaborador",
	TYPES_GET_FAILED: "Erro ao buscar tipos de colaborador",
	TYPE_INACTIVE: "Selecione uma função ativa",
	TYPE_NOT_FOUND: "Função não encontrada",
	UPDATE_FORBIDDEN: "Você não tem permissão para editar este colaborador",
	UPDATE_FAILED: "Erro ao atualizar colaborador",
	REFERRAL_PERCENTAGE_TOO_HIGH:
		"Percentual de indicação não pode exceder o percentual de remuneração",
	OAB_REQUIRED: "OAB é obrigatória",
} as const;
