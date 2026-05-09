export const EMPLOYEE_ERRORS = {
	MANAGE_FORBIDDEN: "Apenas administradores podem gerenciar funcionários",
	CREATE_FORBIDDEN: "Você não tem permissão para criar funcionários",
	CREATE_FAILED: "Erro ao criar funcionário",
	DELETE_FORBIDDEN: "Apenas administradores podem excluir funcionários",
	DELETE_FAILED: "Erro ao excluir funcionário",
	DELETE_ACTIVE_DEPENDENCIES:
		"Não é possível excluir funcionário com remunerações ativas",
	EMAIL_ALREADY_IN_USE: "Este email já está em uso",
	GRANT_ACCESS_ALREADY_ENABLED:
		"Este colaborador já possui acesso ativo ao sistema",
	GRANT_ACCESS_FAILED: "Não foi possível conceder acesso ao colaborador",
	GRANT_ACCESS_INACTIVE_EMPLOYEE:
		"Somente colaboradores ativos podem receber acesso ao sistema",
	NOT_FOUND: "Funcionário não encontrado",
	GET_FAILED: "Erro ao buscar funcionários",
	ROLES_GET_FAILED: "Erro ao buscar cargos de funcionário",
	RESTORE_FORBIDDEN: "Apenas administradores podem restaurar funcionários",
	RESTORE_FAILED: "Erro ao restaurar funcionário",
	REVOKE_ACCESS_FAILED: "Não foi possível revogar o acesso do colaborador",
	REVOKE_ACCESS_UNAVAILABLE:
		"Este colaborador não possui acesso ativo ao sistema",
	RESET_PASSWORD_FAILED: "Não foi possível resetar a senha do colaborador",
	RESET_PASSWORD_UNAVAILABLE:
		"Este colaborador ainda não possui acesso ao sistema",
	TYPES_GET_FAILED: "Erro ao buscar tipos de funcionário",
	TYPE_INACTIVE: "Selecione uma função ativa",
	TYPE_NOT_FOUND: "Função não encontrada",
	ROLE_INACTIVE: "Selecione um perfil ativo",
	ROLE_NOT_FOUND: "Perfil não encontrado",
	UPDATE_FORBIDDEN: "Você não tem permissão para editar este funcionário",
	UPDATE_FAILED: "Erro ao atualizar funcionário",
	REFERRAL_PERCENTAGE_TOO_HIGH:
		"Percentual de indicação não pode exceder o percentual de remuneração",
	OAB_REQUIRED: "OAB é obrigatória",
} as const;
