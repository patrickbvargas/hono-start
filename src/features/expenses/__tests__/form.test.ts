import { describe, expect, it } from "vitest";
import { EXPENSE_ERRORS } from "../constants/errors";
import {
	expenseCreateInputSchema,
	expenseUpdateInputSchema,
} from "../schemas/form";

describe("expense form schemas", () => {
	it("accepts a valid create payload", () => {
		const result = expenseCreateInputSchema.safeParse({
			category: " PHONE ",
			expenseDate: "2026-06-09",
			amount: 2500,
			notes: "  Conta principal  ",
			isActive: true,
		});

		expect(result.success).toBe(true);
		expect(result.data).toEqual({
			category: "PHONE",
			expenseDate: "2026-06-09",
			amount: 2500,
			notes: "Conta principal",
			isActive: true,
		});
	});

	it("rejects a non-positive amount on create", () => {
		const result = expenseCreateInputSchema.safeParse({
			category: "PHONE",
			expenseDate: "2026-06-09",
			amount: 0,
			notes: "",
			isActive: true,
		});

		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toBe(
			EXPENSE_ERRORS.AMOUNT_TOO_LOW,
		);
	});

	it("accepts a valid update payload", () => {
		const result = expenseUpdateInputSchema.safeParse({
			id: 9,
			category: "OTHER",
			expenseDate: "2026-06-08",
			amount: 99.9,
			notes: "Ajuste",
			isActive: false,
		});

		expect(result.success).toBe(true);
	});
});
