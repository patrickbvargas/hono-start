import type { ValidationIssue } from "@/shared/types/validation";
import { REMUNERATION_ERRORS } from "./constants/errors";

export interface RemunerationWriteInput {
	amount: number;
	effectivePercentage: number;
}

function getRemunerationAmountPositiveIssue(
	amount: number,
): ValidationIssue | null {
	if (amount > 0) {
		return null;
	}

	return {
		path: ["amount"],
		message: REMUNERATION_ERRORS.REMUNERATION_AMOUNT_TOO_LOW,
	};
}

function validateRemunerationAmountRules(amount: number): ValidationIssue[] {
	const amountIssue = getRemunerationAmountPositiveIssue(amount);
	return amountIssue ? [amountIssue] : [];
}

function validateRemunerationEffectivePercentageRules(
	effectivePercentage: number,
): ValidationIssue[] {
	const issues: ValidationIssue[] = [];

	if (effectivePercentage < 0) {
		issues.push({
			path: ["effectivePercentage"],
			message: REMUNERATION_ERRORS.REMUNERATION_PERCENTAGE_TOO_LOW,
		});
	}

	if (effectivePercentage > 1) {
		issues.push({
			path: ["effectivePercentage"],
			message: REMUNERATION_ERRORS.REMUNERATION_PERCENTAGE_TOO_HIGH,
		});
	}

	return issues;
}

export function validateRemunerationWriteRules(
	input: RemunerationWriteInput,
): ValidationIssue[] {
	return [
		...validateRemunerationAmountRules(input.amount),
		...validateRemunerationEffectivePercentageRules(input.effectivePercentage),
	];
}
