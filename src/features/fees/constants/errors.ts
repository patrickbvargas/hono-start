export const FEE_ERRORS = {
	FEE_CREATE_FORBIDDEN: "Você não tem permissão para criar honorários",
	FEE_CREATE_FAILED: "Erro ao criar honorário",
	FEE_DELETE_FORBIDDEN: "Apenas administradores podem excluir honorários",
	FEE_DELETE_FAILED: "Erro ao excluir honorário",
	FEE_NOT_FOUND: "Honorário não encontrado",
	FEE_RESTORE_FORBIDDEN: "Apenas administradores podem restaurar honorários",
	FEE_RESTORE_FAILED: "Erro ao restaurar honorário",
	FEE_UPDATE_FORBIDDEN: "Você não tem permissão para editar este honorário",
	FEE_UPDATE_FAILED: "Erro ao atualizar honorário",
	FEE_SELECT_REVENUE: "Selecione uma receita válida",
	FEE_PARENT_MISMATCH:
		"A receita selecionada não pertence ao contrato informado",
	FEE_AMOUNT_TOO_LOW: "Valor deve ser maior que zero",
	FEE_INSTALLMENT_TOO_LOW: "Parcela deve ser maior que zero",
	FEE_DUPLICATE_INSTALLMENT: "Já existe um honorário ativo para esta parcela",
	FEE_CONTRACT_EXHAUSTED:
		"Não é possível lançar honorários após quitar todas as parcelas previstas",
	FEE_REPARENT_MANUAL_OVERRIDE_BLOCKED:
		"Não é possível trocar o contrato ou a receita de um honorário com remunerações manuais",
	FEE_REPARENT_PRESERVE_BLOCKED:
		"Não é possível trocar o contrato ou a receita ao preservar remunerações existentes",
	FEE_CONTRACT_STATUS_NOT_FOUND: "Status do contrato não encontrado",
	FEE_GET_FAILED: "Erro ao buscar honorários",
	FEE_DETAIL_NOT_FOUND: "Honorário não encontrado",
	FEE_DETAIL_FAILED: "Erro ao buscar honorário",
	FEE_SELECTABLE_CONTRACTS_FAILED: "Erro ao buscar contratos disponíveis",
	FEE_SELECTABLE_REVENUES_FAILED: "Erro ao buscar receitas disponíveis",
} as const;
