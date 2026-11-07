export const FINANCIAL_TITLE_ERRORS = {
	AMOUNT_INVALID:
		"Valor deve ser positivo, ter no máximo duas casas decimais e respeitar o limite financeiro.",
	CLOSURE_BALANCE_MISMATCH:
		"A soma dos títulos deve ser igual ao valor negociado, exatamente em centavos.",
	COUNTERPARTY_UNAVAILABLE:
		"Cliente ou fornecedor não encontrado, inativo ou excluído.",
	REVENUE_UNAVAILABLE:
		"Receita ou contrato não encontrado, inativo ou excluído.",
	EXPENSE_UNAVAILABLE: "Despesa não encontrada, inativa ou excluída.",
	ALREADY_GENERATED:
		"Esta origem já possui títulos financeiros. Cancele e reconcilie os títulos antes de gerar novamente.",
	ANALYTIC_UNAVAILABLE: "Categoria financeira não encontrada ou inativa.",
	PAYMENT_METHOD_UNAVAILABLE: "Forma de pagamento não encontrada ou inativa.",
	NOTES_REQUIRED: "Justificativa é obrigatória para lançamento direto.",
	GENERATE_FAILED: "Não foi possível gerar os títulos financeiros.",
	CREATE_FAILED: "Não foi possível criar o título financeiro.",
} as const;
