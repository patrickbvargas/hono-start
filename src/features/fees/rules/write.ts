import { FEE_ERRORS } from "../constants/errors";
import type { FeeCreateInput, FeeUpdateInput } from "../schemas/form";

type FeeWriteInput = FeeCreateInput | FeeUpdateInput;

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
		throw new Error(FEE_ERRORS.FEE_AMOUNT_TOO_LOW);
	}
}

export function assertFeeInstallmentNumber(
	installmentNumber: number,
	totalInstallments?: number,
) {
	if (
		totalInstallments !== undefined &&
		installmentNumber > totalInstallments
	) {
		throw new Error(FEE_ERRORS.FEE_INSTALLMENT_TOO_HIGH);
	}
	if (installmentNumber < 1) {
		throw new Error(FEE_ERRORS.FEE_INSTALLMENT_TOO_LOW);
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
		throw new Error(FEE_ERRORS.FEE_DUPLICATE_INSTALLMENT);
	}
}

export function assertFeeParentConsistency({
	contractId,
	revenueContractId,
}: AssertFeeParentConsistencyParams) {
	if (contractId !== revenueContractId) {
		throw new Error(FEE_ERRORS.FEE_PARENT_MISMATCH);
	}
}

export function assertFeeWriteRules(input: FeeWriteInput) {
	assertFeeAmountPositive(input.amount);
	assertFeeInstallmentNumber(input.installmentNumber);
}

export function assertFeeInstallmentSequence({
	fees,
	installmentNumber,
	excludeFeeId,
}: AssertUniqueActiveInstallmentParams) {
	const recorded = new Set(
		fees
			.filter(
				(fee) =>
					fee.id !== excludeFeeId && fee.isActive && fee.deletedAt === null,
			)
			.map((fee) => fee.installmentNumber),
	);
	for (let number = 1; number < installmentNumber; number += 1) {
		if (!recorded.has(number)) {
			throw new Error("Registre as parcelas anteriores antes desta parcela.");
		}
	}
}
