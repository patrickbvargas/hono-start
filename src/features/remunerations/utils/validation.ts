import { REMUNERATION_ERRORS } from "../constants/errors";

export function assertRemunerationAmountPositive(amount: number) {
	if (amount <= 0) {
		throw new Error(REMUNERATION_ERRORS.REMUNERATION_AMOUNT_TOO_LOW);
	}
}

export function assertRemunerationEffectivePercentage(
	effectivePercentage: number,
) {
	if (effectivePercentage < 0) {
		throw new Error(REMUNERATION_ERRORS.REMUNERATION_PERCENTAGE_TOO_LOW);
	}

	if (effectivePercentage > 1) {
		throw new Error(REMUNERATION_ERRORS.REMUNERATION_PERCENTAGE_TOO_HIGH);
	}
}
