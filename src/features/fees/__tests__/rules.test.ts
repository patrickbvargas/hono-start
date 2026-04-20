import { describe, expect, it } from "vitest";
import { FEE_ERRORS } from "../constants/errors";
import {
	assertFeeAmountPositive,
	assertFeeInstallmentNumber,
	assertFeeParentConsistency,
	assertFeeWriteRules,
	assertUniqueActiveInstallment,
} from "../rules/write";

describe("assertFeeWriteRules", () => {
	it("does not throw for a valid fee payload", () => {
		expect(() =>
			assertFeeWriteRules({
				contractId: "1",
				revenueId: "2",
				paymentDate: "2026-04-15",
				amount: 1500,
				installmentNumber: 2,
				generatesRemuneration: true,
				isActive: true,
			}),
		).not.toThrow();
	});

	it("throws the amount error when amount is not positive", () => {
		expect(() => assertFeeAmountPositive(0)).toThrow(
			FEE_ERRORS.FEE_AMOUNT_TOO_LOW,
		);
	});

	it("throws the installment error when installment number is below one", () => {
		expect(() => assertFeeInstallmentNumber(0)).toThrow(
			FEE_ERRORS.FEE_INSTALLMENT_TOO_LOW,
		);
	});
});

describe("assertUniqueActiveInstallment", () => {
	it("throws when an active installment is duplicated", () => {
		expect(() =>
			assertUniqueActiveInstallment({
				fees: [
					{
						id: 1,
						installmentNumber: 3,
						isActive: true,
						deletedAt: null,
					},
				],
				installmentNumber: 3,
			}),
		).toThrow(FEE_ERRORS.FEE_DUPLICATE_INSTALLMENT);
	});

	it("ignores the current fee during update checks", () => {
		expect(() =>
			assertUniqueActiveInstallment({
				excludeFeeId: 1,
				fees: [
					{
						id: 1,
						installmentNumber: 3,
						isActive: true,
						deletedAt: null,
					},
				],
				installmentNumber: 3,
			}),
		).not.toThrow();
	});
});

describe("fee side-effect helpers", () => {
	it("preserves parent consistency checks", () => {
		expect(() =>
			assertFeeParentConsistency({
				contractId: 1,
				revenueContractId: 2,
			}),
		).toThrow(FEE_ERRORS.FEE_PARENT_MISMATCH);
	});
});
