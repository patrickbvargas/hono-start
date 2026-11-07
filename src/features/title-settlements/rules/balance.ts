import type { Prisma } from "@/generated/prisma/client";
import { SETTLEMENT_ERRORS } from "../constants/errors";

export function assertSettlementBalance(
	amount: Prisma.Decimal,
	principal: Prisma.Decimal,
	paid: Prisma.Decimal,
	cancelled: Date | null,
) {
	if (cancelled) {
		throw new Error(SETTLEMENT_ERRORS.CANCELLED);
	}
	if (principal.lte(0) || principal.gt(amount.minus(paid))) {
		throw new Error(SETTLEMENT_ERRORS.BALANCE);
	}
}
