export const EMPLOYEE_ERRORS = {
	EMPLOYEE_MANAGE_FORBIDDEN:
		"Apenas administradores podem gerenciar funcionários",
	EMPLOYEE_CREATE_FORBIDDEN: "Você não tem permissão para criar funcionários",
	EMPLOYEE_CREATE_FAILED: "Erro ao criar funcionário",
	EMPLOYEE_DELETE_FORBIDDEN:
		"Apenas administradores podem excluir funcionários",
	EMPLOYEE_DELETE_FAILED: "Erro ao excluir funcionário",
	EMPLOYEE_EMAIL_ALREADY_IN_USE: "Este email já está em uso",
	EMPLOYEE_NOT_FOUND: "Funcionário não encontrado",
	EMPLOYEE_GET_FAILED: "Erro ao buscar funcionários",
	EMPLOYEE_ROLES_GET_FAILED: "Erro ao buscar cargos de funcionário",
	EMPLOYEE_RESTORE_FORBIDDEN:
		"Apenas administradores podem restaurar funcionários",
	EMPLOYEE_RESTORE_FAILED: "Erro ao restaurar funcionário",
	EMPLOYEE_TYPES_GET_FAILED: "Erro ao buscar tipos de funcionário",
	EMPLOYEE_TYPE_INACTIVE: "Selecione uma função ativa",
	EMPLOYEE_TYPE_NOT_FOUND: "Função não encontrada",
	EMPLOYEE_ROLE_INACTIVE: "Selecione um perfil ativo",
	EMPLOYEE_ROLE_NOT_FOUND: "Perfil não encontrado",
	EMPLOYEE_UPDATE_FORBIDDEN:
		"Você não tem permissão para editar este funcionário",
	EMPLOYEE_UPDATE_FAILED: "Erro ao atualizar funcionário",
	EMPLOYEE_REFERRAL_PERCENTAGE_TOO_HIGH:
		"Percentual de indicação não pode exceder o percentual de remuneração",
	EMPLOYEE_OAB_REQUIRED: "OAB é obrigatória",
} as const;
