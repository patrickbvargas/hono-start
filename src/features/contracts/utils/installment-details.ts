import { parseDate } from "@internationalized/date";
import { Prisma } from "@/generated/prisma/client";

export function getInstallmentDetails(revenue: {
	paymentStartDate: Date;
	totalInstallments: number;
	totalValue: { toString(): string };
	downPaymentValue: { toString(): string } | null;
	fees: Array<{
		installmentNumber?: number;
		amount: { toString(): string };
		paymentDate?: Date;
	}>;
}) {
	const principal = new Prisma.Decimal(revenue.totalValue.toString()).minus(
		revenue.downPaymentValue?.toString() ?? 0,
	);
	const regular = principal.div(revenue.totalInstallments).toDecimalPlaces(2);
	const start = parseDate(revenue.paymentStartDate.toISOString().slice(0, 10));
	return Array.from({ length: revenue.totalInstallments }, (_, index) => {
		const number = index + 1;
		const expected =
			number === revenue.totalInstallments
				? principal.minus(regular.mul(index))
				: regular;
		const fee = revenue.fees.find((item) => item.installmentNumber === number);
		const received = new Prisma.Decimal(fee?.amount.toString() ?? 0);
		return {
			number,
			dueDate: start.add({ months: number }).toString(),
			expectedAmount: Number(expected),
			receivedAmount: Number(received),
			remainingAmount: Number(Prisma.Decimal.max(expected.minus(received), 0)),
			paymentDate: fee?.paymentDate?.toISOString() ?? null,
		};
	});
}
