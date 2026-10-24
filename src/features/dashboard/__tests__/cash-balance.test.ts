import { describe, expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import { buildMonthlyCashFlow } from "../data/cash-flow";

describe("cash balance", () => {
	it.each([0, 100, 250])(
		"does not deduct generated remuneration (%s) from cash",
		(amount) => {
			const date = new Date("2026-01-15T12:00:00Z");
			const result = buildMonthlyCashFlow({
				range: {
					startMonth: new Date("2026-01-01"),
					endMonth: new Date("2026-01-01"),
					label: "Jan/2026",
				},
				chartDownPayments: [],
				chartFees: [
					{
						amount: new Prisma.Decimal(500),
						paymentDate: date,
						revenue: { type: { value: "JUDICIAL" } },
					},
				],
				chartRemunerations: [
					{ amount: new Prisma.Decimal(amount), paymentDate: date },
				],
				chartExpenses: [{ amount: new Prisma.Decimal(150), expenseDate: date }],
			});
			expect(result.table[0]).toMatchObject({
				entry: 500,
				remuneration: amount,
				expense: 150,
				output: 150,
				balance: 350,
			});
			expect(result.chart[0]).toMatchObject({
				entry: 500,
				output: 150,
				balance: 350,
			});
		},
	);
});
