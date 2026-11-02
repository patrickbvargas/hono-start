import { describe, expect, it } from "vitest";
import {
	contractCreateInputSchema,
	contractUpdateInputSchema,
} from "../contracts/schemas/form";
import {
	expenseCreateInputSchema,
	expenseUpdateInputSchema,
} from "../expenses/schemas/form";
import {
	personCreateInputSchema,
	personUpdateInputSchema,
} from "../people/schemas/form";

describe("write form text limits", () => {
	it.each([
		["person create name", personCreateInputSchema.shape.fullName, 255],
		["person update name", personUpdateInputSchema.shape.fullName, 255],
		[
			"contract create process",
			contractCreateInputSchema.shape.processNumber,
			100,
		],
		[
			"contract update process",
			contractUpdateInputSchema.shape.processNumber,
			100,
		],
		["contract create notes", contractCreateInputSchema.shape.notes, 5000],
		["contract update notes", contractUpdateInputSchema.shape.notes, 5000],
		["expense create notes", expenseCreateInputSchema.shape.notes, 5000],
		["expense update notes", expenseUpdateInputSchema.shape.notes, 5000],
	] as const)(
		"accepts the limit and rejects overflow: %s",
		(_name, schema, limit) => {
			expect(schema.safeParse("a".repeat(limit)).success).toBe(true);
			expect(schema.safeParse("a".repeat(limit + 1)).success).toBe(false);
		},
	);

	it.each([personCreateInputSchema, personUpdateInputSchema])(
		"checks contacts before normalization",
		(schema) => {
			expect(schema.shape.document.parse("12.345.678/0001-90")).toBe(
				"12345678000190",
			);
			expect(schema.shape.document.safeParse("1".repeat(19)).success).toBe(
				false,
			);
			expect(schema.shape.phone.parse("(51) 99999-9999")).toBe("51999999999");
			expect(schema.shape.phone.safeParse("1".repeat(16)).success).toBe(false);
			const email = `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(61)}`;
			expect(email.length).toBe(254);
			expect(schema.shape.email.safeParse(email).success).toBe(true);
			expect(schema.shape.email.safeParse(`${email}d`).success).toBe(false);
			expect(schema.shape.email.parse("")).toBe("");
		},
	);
});
