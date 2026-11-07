export const SETTLEMENT_ERRORS = {
	FAILED: "Não foi possível concluir a operação financeira.",
	UNAVAILABLE: "Título ou movimentação indisponível.",
	BALANCE: "Principal deve ser positivo e não pode superar o saldo atual.",
	CANCELLED: "Título cancelado não aceita baixa.",
	METHOD: "Meio de pagamento indisponível.",
	RETRY: "Solicitação já utilizada com outros dados. Reabra o formulário.",
	REVERSED: "Esta movimentação já foi estornada.",
	DATE: "Data deve ser hoje ou passada e o estorno não pode anteceder a baixa.",
	DEPENDENCY:
		"Estorne primeiro os pagamentos das remunerações geradas por este recebimento.",
	REMUNERATION:
		"Equipe ou configuração financeira indisponível para gerar remunerações.",
} as const;
