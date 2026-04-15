import { describe, expect, it } from "vitest";
import { FEE_ERRORS } from "../constants/errors";
import {
	validateFeeParentConsistency,
	validateFeeShouldGenerateRemunerations,
	validateFeeShouldRecalculateSystemGeneratedRemunerations,
	validateFeeWriteRules,
	validateUniqueActiveInstallment,
} from "../rules";

describe("validateFeeWriteRules", () => {
	it("returns no issues for a valid fee payload", () => {
		expect(
			validateFeeWriteRules({
				contractId: "1",
				revenueId: "2",
				paymentDate: "2026-04-15",
				amount: 1500,
				installmentNumber: 2,
				generatesRemuneration: true,
				isActive: true,
			}),
		).toEqual([]);
	});

	it("returns the amount error when amount is not positive", () => {
		expect(
			validateFeeWriteRules({
				contractId: "1",
				revenueId: "2",
				paymentDate: "2026-04-15",
				amount: 0,
				installmentNumber: 2,
				generatesRemuneration: true,
				isActive: true,
			}),
		).toEqual([
			{
				path: ["amount"],
				message: FEE_ERRORS.FEE_AMOUNT_TOO_LOW,
			},
		]);
	});

	it("returns the installment error when installment number is below one", () => {
		expect(
			validateFeeWriteRules({
				contractId: "1",
				revenueId: "2",
				paymentDate: "2026-04-15",
				amount: 1500,
				installmentNumber: 0,
				generatesRemuneration: true,
				isActive: true,
			}),
		).toEqual([
			{
				path: ["installmentNumber"],
				message: FEE_ERRORS.FEE_INSTALLMENT_TOO_LOW,
			},
		]);
	});
});

describe("validateUniqueActiveInstallment", () => {
	it("throws when an active installment is duplicated", () => {
		expect(() =>
			validateUniqueActiveInstallment({
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
			validateUniqueActiveInstallment({
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
			validateFeeParentConsistency({
				contractId: 1,
				revenueContractId: 2,
			}),
		).toThrow(FEE_ERRORS.FEE_PARENT_MISMATCH);
	});

	it("keeps remuneration-generation decisions unchanged", () => {
		expect(validateFeeShouldGenerateRemunerations(true)).toBe(true);
		expect(validateFeeShouldGenerateRemunerations(false)).toBe(false);
		expect(validateFeeShouldRecalculateSystemGeneratedRemunerations(true)).toBe(
			true,
		);
		expect(
			validateFeeShouldRecalculateSystemGeneratedRemunerations(false),
		).toBe(false);
	});
});
