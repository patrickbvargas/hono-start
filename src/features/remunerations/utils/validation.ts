export function assertRemunerationAmountPositive(amount: number) {
	if (amount <= 0) {
		throw new Error("Valor deve ser maior que zero");
	}
}

export function assertRemunerationEffectivePercentage(
	effectivePercentage: number,
) {
	if (effectivePercentage < 0) {
		throw new Error("Percentual não pode ser negativo");
	}

	if (effectivePercentage > 1) {
		throw new Error("Percentual deve ser menor ou igual a 100%");
	}
}
