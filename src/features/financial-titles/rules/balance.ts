import { Prisma } from "@/generated/prisma/client";
import { FINANCIAL_TITLE_ERRORS } from "../constants/errors";

export function assertClosureBalance(
	negotiatedAmount: Prisma.Decimal,
	titles: readonly { amount: number }[],
) {
	const total = titles.reduce(
		(sum, title) => sum.plus(String(title.amount)),
		new Prisma.Decimal(0),
	);
	if (!total.equals(negotiatedAmount)) {
		throw new Error(FINANCIAL_TITLE_ERRORS.CLOSURE_BALANCE_MISMATCH);
	}
}
