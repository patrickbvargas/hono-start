import { describe, expect, it } from "vitest";
import { assertFeeInstallmentSequence } from "../rules/write";

describe("receipt sequence", () => {
	const first = {
		id: 1,
		installmentNumber: 1,
		isActive: true,
		deletedAt: null,
	};
	it("allows the first and then the second installment", () => {
		expect(() =>
			assertFeeInstallmentSequence({ fees: [], installmentNumber: 1 }),
		).not.toThrow();
		expect(() =>
			assertFeeInstallmentSequence({ fees: [first], installmentNumber: 2 }),
		).not.toThrow();
	});
	it("rejects skipped, inactive and deleted predecessors", () => {
		for (const fees of [
			[],
			[{ ...first, isActive: false }],
			[{ ...first, deletedAt: new Date() }],
		]) {
			expect(() =>
				assertFeeInstallmentSequence({ fees, installmentNumber: 2 }),
			).toThrow("Registre as parcelas anteriores");
		}
	});
	it("does not count the edited record as its own predecessor", () => {
		expect(() =>
			assertFeeInstallmentSequence({
				fees: [first],
				excludeFeeId: 1,
				installmentNumber: 2,
			}),
		).toThrow();
	});
});
