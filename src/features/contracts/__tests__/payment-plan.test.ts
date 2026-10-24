import { describe, expect, it } from "vitest";
import { getNextContractInstallment } from "../utils/payment-plan";

const revenue = {
	paymentStartDate: new Date("2026-01-31T00:00:00Z"),
	totalValue: "100",
	downPaymentValue: null,
	totalInstallments: 3,
	fees: [] as Array<{ installmentNumber: number; amount: string }>,
};

describe("contract payment plan", () => {
	it("matches the dashboard schedule and preserves the original day across short months", () => {
		expect(getNextContractInstallment(revenue)).toEqual({
			nextInstallmentNumber: 1,
			nextDueDate: "2026-02-28",
		});
		expect(
			getNextContractInstallment({
				...revenue,
				fees: [{ installmentNumber: 1, amount: "33.33" }],
			}),
		).toEqual({ nextInstallmentNumber: 2, nextDueDate: "2026-03-31" });
	});
	it("does not confuse the next recordable installment with a partially unpaid installment", () => {
		expect(
			getNextContractInstallment({
				...revenue,
				fees: [
					{ installmentNumber: 1, amount: "10" },
					{ installmentNumber: 3, amount: "33.34" },
				],
			}),
		).toEqual({ nextInstallmentNumber: 2, nextDueDate: "2026-02-28" });
	});
	it("returns no due date when the entry covers the whole principal", () => {
		expect(
			getNextContractInstallment({ ...revenue, downPaymentValue: "100" })
				.nextDueDate,
		).toBeNull();
	});
	it("preserves the residual cent in the last installment", () => {
		expect(
			getNextContractInstallment({
				...revenue,
				fees: [
					{ installmentNumber: 1, amount: "33.33" },
					{ installmentNumber: 2, amount: "33.33" },
					{ installmentNumber: 3, amount: "33.33" },
				],
			}),
		).toEqual({ nextInstallmentNumber: null, nextDueDate: "2026-04-30" });
	});
});
