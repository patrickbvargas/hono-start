import { REMUNERATION_ERRORS } from "../constants/errors";

interface RemunerationWriteInput {
	amount: number;
	effectivePercentage: number;
}

export function assertRemunerationAmountPositive(amount: number) {
	if (amount <= 0) {
		throw new Error(REMUNERATION_ERRORS.REMUNERATION_AMOUNT_TOO_LOW);
	}
}

export function assertRemunerationEffectivePercentageRange(
	effectivePercentage: number,
) {
	if (effectivePercentage < 0) {
		throw new Error(REMUNERATION_ERRORS.REMUNERATION_PERCENTAGE_TOO_LOW);
	}

	if (effectivePercentage > 1) {
		throw new Error(REMUNERATION_ERRORS.REMUNERATION_PERCENTAGE_TOO_HIGH);
	}
}

export function assertRemunerationWriteRules(input: RemunerationWriteInput) {
	assertRemunerationAmountPositive(input.amount);
	assertRemunerationEffectivePercentageRange(input.effectivePercentage);
}
