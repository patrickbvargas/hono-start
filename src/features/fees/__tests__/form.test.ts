import { describe, expect, it } from "vitest";
import { FEE_ERRORS } from "../constants/errors";
import { feeCreateInputSchema, feeUpdateInputSchema } from "../schemas/form";

describe("fee form schemas", () => {
	it("accepts a valid create payload", () => {
		const result = feeCreateInputSchema.safeParse({
			contractId: " 1 ",
			revenueId: " 2 ",
			paymentDate: "2026-04-15",
			amount: 2500,
			installmentNumber: 2,
			generatesRemuneration: true,
			isActive: true,
		});

		expect(result.success).toBe(true);
		expect(result.data).toEqual({
			contractId: "1",
			revenueId: "2",
			paymentDate: "2026-04-15",
			amount: 2500,
			installmentNumber: 2,
			generatesRemuneration: true,
			isActive: true,
		});
	});

	it("rejects a non-positive amount on create", () => {
		const result = feeCreateInputSchema.safeParse({
			contractId: "1",
			revenueId: "2",
			paymentDate: "2026-04-15",
			amount: 0,
			installmentNumber: 2,
			generatesRemuneration: true,
			isActive: true,
		});

		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toBe(
			FEE_ERRORS.FEE_AMOUNT_TOO_LOW,
		);
	});

	it("rejects an installment number below one on update", () => {
		const result = feeUpdateInputSchema.safeParse({
			id: 1,
			contractId: "1",
			revenueId: "2",
			paymentDate: "2026-04-15",
			amount: 2500,
			installmentNumber: 0,
			generatesRemuneration: false,
			isActive: true,
		});

		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toBe(
			FEE_ERRORS.FEE_INSTALLMENT_TOO_LOW,
		);
	});
});
