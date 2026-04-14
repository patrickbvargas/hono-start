interface AssertUniqueActiveInstallmentParams {
	excludeFeeId?: number;
	fees: Array<{
		id: number;
		installmentNumber: number;
		isActive: boolean;
		deletedAt: Date | null;
	}>;
	installmentNumber: number;
}

interface AssertFeeParentConsistencyParams {
	contractId: number;
	revenueContractId: number;
}

export function assertFeeAmountPositive(amount: number) {
	if (amount <= 0) {
		throw new Error("Valor deve ser maior que zero");
	}
}

export function assertFeeInstallmentNumber(installmentNumber: number) {
	if (installmentNumber < 1) {
		throw new Error("Parcela deve ser maior que zero");
	}
}

export function assertUniqueActiveInstallment({
	excludeFeeId,
	fees,
	installmentNumber,
}: AssertUniqueActiveInstallmentParams) {
	const hasDuplicate = fees.some((fee) => {
		if (excludeFeeId && fee.id === excludeFeeId) {
			return false;
		}

		return (
			fee.installmentNumber === installmentNumber &&
			fee.isActive &&
			fee.deletedAt === null
		);
	});

	if (hasDuplicate) {
		throw new Error("Já existe um honorário ativo para esta parcela");
	}
}

export function assertFeeParentConsistency({
	contractId,
	revenueContractId,
}: AssertFeeParentConsistencyParams) {
	if (contractId !== revenueContractId) {
		throw new Error("A receita selecionada não pertence ao contrato informado");
	}
}

export function shouldGenerateFeeRemunerations(generatesRemuneration: boolean) {
	return generatesRemuneration;
}

export function shouldRecalculateSystemGeneratedRemunerations(
	generatesRemuneration: boolean,
) {
	return generatesRemuneration;
}
