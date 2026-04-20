import { describe, expect, it } from "vitest";
import { REMUNERATION_ERRORS } from "../constants/errors";
import { remunerationUpdateInputSchema } from "../schemas/form";

describe("remuneration form schemas", () => {
	it("accepts a valid update payload", () => {
		const result = remunerationUpdateInputSchema.safeParse({
			id: 1,
			amount: 1500,
			effectivePercentage: 0.4,
		});

		expect(result.success).toBe(true);
		expect(result.data).toEqual({
			id: 1,
			amount: 1500,
			effectivePercentage: 0.4,
		});
	});

	it("rejects a non-positive amount", () => {
		const result = remunerationUpdateInputSchema.safeParse({
			id: 1,
			amount: 0,
			effectivePercentage: 0.4,
		});

		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toBe(
			REMUNERATION_ERRORS.REMUNERATION_AMOUNT_TOO_LOW,
		);
		expect(result.error?.issues[0]?.path).toEqual(["amount"]);
	});

	it("rejects a negative effective percentage", () => {
		const result = remunerationUpdateInputSchema.safeParse({
			id: 1,
			amount: 1500,
			effectivePercentage: -0.1,
		});

		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toBe(
			REMUNERATION_ERRORS.REMUNERATION_PERCENTAGE_TOO_LOW,
		);
		expect(result.error?.issues[0]?.path).toEqual(["effectivePercentage"]);
	});

	it("rejects an effective percentage above one", () => {
		const result = remunerationUpdateInputSchema.safeParse({
			id: 1,
			amount: 1500,
			effectivePercentage: 1.1,
		});

		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toBe(
			REMUNERATION_ERRORS.REMUNERATION_PERCENTAGE_TOO_HIGH,
		);
		expect(result.error?.issues[0]?.path).toEqual(["effectivePercentage"]);
	});
});
