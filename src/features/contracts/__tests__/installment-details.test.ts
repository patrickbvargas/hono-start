import { describe, expect, it } from "vitest";
import { getInstallmentDetails } from "../utils/installment-details";
import { getInstallmentStatus } from "../utils/installment-status";

describe("installment details", () => {
	it("deducts entry, preserves month ends and allocates rounding to final row", () => {
		const rows = getInstallmentDetails({
			paymentStartDate: new Date("2026-01-31Z"),
			totalInstallments: 3,
			totalValue: "110",
			downPaymentValue: "10",
			fees: [
				{
					installmentNumber: 1,
					amount: "20",
					paymentDate: new Date("2026-02-15Z"),
				},
			],
		});
		expect(rows.map((row) => row.expectedAmount)).toEqual([
			33.33, 33.33, 33.34,
		]);
		expect(rows.map((row) => row.dueDate)).toEqual([
			"2026-02-28",
			"2026-03-31",
			"2026-04-30",
		]);
		expect(rows[0]).toMatchObject({
			receivedAmount: 20,
			remainingAmount: 13.33,
			paymentDate: "2026-02-15T00:00:00.000Z",
		});
		expect(rows[1].paymentDate).toBeNull();
	});
	it.each([
		[0, 100, "2026-01-01", "Recebida"],
		[20, 80, "2026-01-01", "Em atraso"],
		[20, 80, "2026-10-29", "Parcial"],
		[100, 0, "2026-10-30", "Pendente"],
	] as const)(
		"derives status for remaining %s received %s due %s",
		(remainingAmount, receivedAmount, dueDate, status) => {
			expect(
				getInstallmentStatus(
					{ remainingAmount, receivedAmount, dueDate },
					"2026-10-29",
				),
			).toBe(status);
		},
	);
});
