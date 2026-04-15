import type { ValidationIssue } from "@/shared/types/validation";
import { FEE_ERRORS } from "./constants/errors";
import type { FeeCreateInput, FeeUpdateInput } from "./schemas/form";

type FeeWriteInput = FeeCreateInput | FeeUpdateInput;

interface ValidateUniqueActiveInstallmentParams {
	excludeFeeId?: number;
	fees: Array<{
		id: number;
		installmentNumber: number;
		isActive: boolean;
		deletedAt: Date | null;
	}>;
	installmentNumber: number;
}

interface ValidateFeeParentConsistencyParams {
	contractId: number;
	revenueContractId: number;
}

function getFeeAmountPositiveIssue(amount: number): ValidationIssue | null {
	if (amount > 0) {
		return null;
	}

	return {
		path: ["amount"],
		message: FEE_ERRORS.FEE_AMOUNT_TOO_LOW,
	};
}

function getFeeInstallmentNumberIssue(
	installmentNumber: number,
): ValidationIssue | null {
	if (installmentNumber >= 1) {
		return null;
	}

	return {
		path: ["installmentNumber"],
		message: FEE_ERRORS.FEE_INSTALLMENT_TOO_LOW,
	};
}

export function validateFeeWriteRules(input: FeeWriteInput): ValidationIssue[] {
	const issues: ValidationIssue[] = [];

	const amountIssue = getFeeAmountPositiveIssue(input.amount);
	if (amountIssue) {
		issues.push(amountIssue);
	}

	const installmentNumberIssue = getFeeInstallmentNumberIssue(
		input.installmentNumber,
	);
	if (installmentNumberIssue) {
		issues.push(installmentNumberIssue);
	}

	return issues;
}

export function validateUniqueActiveInstallment({
	excludeFeeId,
	fees,
	installmentNumber,
}: ValidateUniqueActiveInstallmentParams) {
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

export function validateFeeParentConsistency({
	contractId,
	revenueContractId,
}: ValidateFeeParentConsistencyParams) {
	if (contractId !== revenueContractId) {
		throw new Error(FEE_ERRORS.FEE_PARENT_MISMATCH);
	}
}

export function validateFeeShouldGenerateRemunerations(
	generatesRemuneration: boolean,
) {
	return generatesRemuneration;
}

export function validateFeeShouldRecalculateSystemGeneratedRemunerations(
	generatesRemuneration: boolean,
) {
	return generatesRemuneration;
}
