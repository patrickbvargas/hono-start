export const CONTRACT_ERRORS = {
	CONTRACT_CREATE_FORBIDDEN: "Você não tem permissão para criar contratos",
	CONTRACT_CREATE_FAILED: "Erro ao criar contrato",
	CONTRACT_DELETE_FORBIDDEN: "Apenas administradores podem excluir contratos",
	CONTRACT_DELETE_FAILED: "Erro ao excluir contrato",
	CONTRACT_HAS_ACTIVE_REVENUES:
		"Não é possível excluir um contrato com receitas ativas",
	CONTRACT_NOT_FOUND: "Contrato não encontrado",
	CONTRACT_RESTORE_FORBIDDEN:
		"Apenas administradores podem restaurar contratos",
	CONTRACT_RESTORE_FAILED: "Erro ao restaurar contrato",
	CONTRACT_UPDATE_FORBIDDEN: "Você não tem permissão para editar este contrato",
	CONTRACT_UPDATE_FAILED: "Erro ao atualizar contrato",
	CONTRACT_STATUS_LOCK_FORBIDDEN:
		"Apenas administradores podem controlar o bloqueio de status",
	CONTRACT_CLIENT_INACTIVE: "Selecione um cliente ativo",
	CONTRACT_LEGAL_AREA_INACTIVE: "Selecione uma área jurídica ativa",
	CONTRACT_STATUS_INACTIVE: "Selecione um status de contrato ativo",
	CONTRACT_NEW_STATUS_REQUIRED:
		"Novos contratos devem começar com status ativo",
	CONTRACT_ASSIGNMENT_REQUIRED: "Informe pelo menos um colaborador",
	CONTRACT_REVENUE_REQUIRED: "Informe pelo menos uma receita",
	CONTRACT_REVENUE_LIMIT: "O contrato permite no máximo três receitas",
	CONTRACT_REVENUE_TYPE_DUPLICATE:
		"Não é permitido repetir tipos de receita ativos",
	CONTRACT_ASSIGNMENT_DUPLICATE:
		"O mesmo colaborador não pode ser atribuído mais de uma vez",
	CONTRACT_DOWN_PAYMENT_TOO_HIGH:
		"A entrada não pode ser maior que o valor total",
	CONTRACT_EMPLOYEE_NOT_FOUND: "Colaborador não encontrado",
	CONTRACT_EMPLOYEE_INACTIVE: "Selecione um colaborador ativo",
	CONTRACT_ASSIGNMENT_TYPE_NOT_FOUND: "Tipo de atribuição não encontrado",
	CONTRACT_ASSIGNMENT_TYPE_INACTIVE: "Selecione um tipo de atribuição ativo",
	CONTRACT_REVENUE_TYPE_NOT_FOUND: "Tipo de receita não encontrado",
	CONTRACT_REVENUE_TYPE_INACTIVE: "Selecione um tipo de receita ativo",
	CONTRACT_ADMIN_ASSISTANT_ASSIGNMENT:
		"Assistentes administrativos só podem usar a atribuição correspondente",
	CONTRACT_LAWYER_ASSIGNMENT:
		"Advogados não podem usar a atribuição de assistente administrativo",
	CONTRACT_REFERRAL_RECOMMENDED_REQUIRED:
		"Contratos com indicação precisam informar ao menos um indicado",
	CONTRACT_REFERRAL_RECOMMENDING_REQUIRED:
		"Contratos com indicado precisam informar ao menos um indicante",
	CONTRACT_REFERRAL_PERCENTAGE_TOO_HIGH:
		"O percentual de indicação não pode exceder o percentual de remuneração do indicado",
	CONTRACT_RESPONSIBLE_LAWYER_REQUIRED:
		"Informe ao menos um advogado responsável",
	CONTRACT_READ_ONLY: "Contratos concluídos ou cancelados são somente leitura",
	CONTRACT_STATUS_CHANGE_FORBIDDEN:
		"Apenas administradores podem alterar o status do contrato",
	CONTRACT_STATUS_CHANGE_LOCKED:
		"As mudanças de status estão bloqueadas para este contrato",
	CONTRACT_PROCESS_NUMBER_DUPLICATE:
		"Este número de processo já está cadastrado",
	CONTRACT_GET_FAILED: "Erro ao buscar contratos",
	CONTRACT_DETAIL_NOT_FOUND: "Contrato não encontrado",
	CONTRACT_DETAIL_FAILED: "Erro ao buscar contrato",
	CONTRACT_LEGAL_AREAS_FAILED: "Erro ao buscar áreas jurídicas",
	CONTRACT_STATUSES_FAILED: "Erro ao buscar status de contrato",
	CONTRACT_ASSIGNMENT_TYPES_FAILED: "Erro ao buscar tipos de atribuição",
	CONTRACT_REVENUE_TYPES_FAILED: "Erro ao buscar tipos de receita",
	CONTRACT_SELECTABLE_CLIENTS_FAILED: "Erro ao buscar clientes disponíveis",
	CONTRACT_SELECTABLE_EMPLOYEES_FAILED:
		"Erro ao buscar colaboradores disponíveis",
} as const;
