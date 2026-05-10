export const EMPLOYEE_ERRORS = {
	MANAGE_FORBIDDEN: "Apenas administradores podem gerenciar colaboradores",
	CREATE_FORBIDDEN: "Você não tem permissão para criar colaboradores",
	CREATE_FAILED: "Erro ao criar colaborador",
	DELETE_FORBIDDEN: "Apenas administradores podem excluir colaboradores",
	DELETE_FAILED: "Erro ao excluir colaborador",
	DELETE_ACTIVE_DEPENDENCIES:
		"Não é possível excluir colaborador com remunerações ativas",
	EMAIL_ALREADY_IN_USE: "Este email já está em uso",
	GRANT_ACCESS_ALREADY_ENABLED:
		"Este colaborador já possui acesso ativo ao sistema",
	GRANT_ACCESS_FAILED: "Não foi possível conceder acesso ao colaborador",
	GRANT_ACCESS_INACTIVE_EMPLOYEE:
		"Somente colaboradores ativos podem receber acesso ao sistema",
	NOT_FOUND: "colaborador não encontrado",
	GET_FAILED: "Erro ao buscar colaboradores",
	ROLES_GET_FAILED: "Erro ao buscar cargos de colaborador",
	RESTORE_FORBIDDEN: "Apenas administradores podem restaurar colaboradores",
	RESTORE_FAILED: "Erro ao restaurar colaborador",
	REVOKE_ACCESS_FAILED: "Não foi possível revogar o acesso do colaborador",
	REVOKE_ACCESS_UNAVAILABLE:
		"Este colaborador não possui acesso ativo ao sistema",
	RESET_PASSWORD_FAILED: "Não foi possível resetar a senha do colaborador",
	RESET_PASSWORD_UNAVAILABLE:
		"Este colaborador ainda não possui acesso ao sistema",
	TYPES_GET_FAILED: "Erro ao buscar tipos de colaborador",
	TYPE_INACTIVE: "Selecione uma função ativa",
	TYPE_NOT_FOUND: "Função não encontrada",
	ROLE_INACTIVE: "Selecione um perfil ativo",
	ROLE_NOT_FOUND: "Perfil não encontrado",
	UPDATE_FORBIDDEN: "Você não tem permissão para editar este colaborador",
	UPDATE_FAILED: "Erro ao atualizar colaborador",
	REFERRAL_PERCENTAGE_TOO_HIGH:
		"Percentual de indicação não pode exceder o percentual de remuneração",
	OAB_REQUIRED: "OAB é obrigatória",
} as const;
