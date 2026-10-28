import { describe, expect, it } from "vitest";
import { formatter } from "@/shared/lib/formatter";
import { getPaymentSummary } from "../utils/payment-summary";

const revenue = {
	totalValue: 1200,
	downPaymentValue: null,
	totalInstallments: 1,
};

describe("contract payment summary", () => {
	it("shows single and multiple installments after subtracting entry", () => {
		expect(getPaymentSummary(revenue)).toBe(
			`1x de ${formatter.currency(1200)}`,
		);
		expect(
			getPaymentSummary({
				...revenue,
				downPaymentValue: 200,
				totalInstallments: 4,
			}),
		).toBe(
			`Entrada de ${formatter.currency(200)} + 4x de ${formatter.currency(250)}`,
		);
	});
	it("shows rounded installments and integral entry", () => {
		expect(
			getPaymentSummary({ ...revenue, totalValue: 100, totalInstallments: 3 }),
		).toBe(`3x de ${formatter.currency(33.33)}`);
		expect(
			getPaymentSummary({ ...revenue, totalValue: 5000, totalInstallments: 6 }),
		).toBe(`6x de ${formatter.currency(833.33)}`);
		expect(getPaymentSummary({ ...revenue, downPaymentValue: 1200 })).toBe(
			`Entrada de ${formatter.currency(1200)} (pagamento integral)`,
		);
	});
	it("omits the entry amount beside form fields while subtracting it", () => {
		expect(
			getPaymentSummary(
				{ ...revenue, downPaymentValue: 200, totalInstallments: 4 },
				{ includeEntry: false },
			),
		).toBe(`4x de ${formatter.currency(250)}`);
		expect(
			getPaymentSummary(
				{ ...revenue, downPaymentValue: 1200 },
				{ includeEntry: false },
			),
		).toBe("Pagamento integral na entrada");
	});
	it.each([
		{ totalValue: Number.NaN },
		{ totalValue: 0 },
		{ downPaymentValue: 1201 },
		{ downPaymentValue: -1 },
		{ totalInstallments: 0 },
		{ totalInstallments: 1.5 },
	])("keeps invalid drafts pending: %o", (draft) => {
		expect(getPaymentSummary({ ...revenue, ...draft })).toBe(
			"Pagamento pendente",
		);
	});
});
