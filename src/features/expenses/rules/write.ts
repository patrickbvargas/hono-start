import { EXPENSE_ERRORS } from "../constants/errors";

export function assertExpenseAmountPositive(amount: number) {
	if (amount <= 0) {
		throw new Error(EXPENSE_ERRORS.AMOUNT_TOO_LOW);
	}
}
