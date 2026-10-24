import { parseDate } from "@internationalized/date";
import { Prisma } from "@/generated/prisma/client";

export function getNextContractInstallment(revenue: {
	paymentStartDate: Date;
	totalInstallments: number;
	totalValue: { toString(): string };
	downPaymentValue: { toString(): string } | null;
	fees: Array<{ installmentNumber?: number; amount: { toString(): string } }>;
}) {
	const paid = new Map<number, Prisma.Decimal>();
	for (const fee of revenue.fees) {
		if (fee.installmentNumber !== undefined) {
			paid.set(
				fee.installmentNumber,
				(paid.get(fee.installmentNumber) ?? new Prisma.Decimal(0)).add(
					fee.amount.toString(),
				),
			);
		}
	}
	let number = 1;
	while (paid.has(number) && number <= revenue.totalInstallments) {
		number += 1;
	}
	const nextInstallmentNumber =
		number <= revenue.totalInstallments ? number : null;
	const principal = new Prisma.Decimal(revenue.totalValue.toString()).minus(
		revenue.downPaymentValue?.toString() ?? 0,
	);
	const regular = principal.div(revenue.totalInstallments).toDecimalPlaces(2);
	let dueNumber = regular.isZero() ? revenue.totalInstallments : 1;
	if (principal.isPositive()) {
		while (dueNumber <= revenue.totalInstallments) {
			const expected =
				dueNumber === revenue.totalInstallments
					? principal.minus(regular.mul(dueNumber - 1))
					: regular;
			if (expected.greaterThan(paid.get(dueNumber) ?? 0)) {
				break;
			}
			dueNumber += 1;
		}
	} else {
		dueNumber = revenue.totalInstallments + 1;
	}
	return {
		nextInstallmentNumber,
		nextDueDate:
			dueNumber > revenue.totalInstallments
				? null
				: parseDate(revenue.paymentStartDate.toISOString().slice(0, 10))
						.add({ months: dueNumber })
						.toString(),
	};
}
