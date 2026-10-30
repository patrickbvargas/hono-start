import { describe, expect, it } from "vitest";
import {
	businessDate,
	remunerationDueDate,
	seedCpf,
} from "../../../../prisma/seed-financial-fixtures";

describe("financial development fixture boundaries", () => {
	it("uses Sao Paulo business date across UTC midnight", () => {
		expect(businessDate(new Date("2026-10-30T01:00:00Z")).toISOString()).toBe(
			"2026-10-29T00:00:00.000Z",
		);
	});
	it("uses cutoff inclusively and rolls December into next year", () => {
		expect(
			remunerationDueDate(new Date("2026-10-25T00:00:00Z")).toISOString(),
		).toBe("2026-11-05T00:00:00.000Z");
		expect(
			remunerationDueDate(new Date("2026-10-26T00:00:00Z")).toISOString(),
		).toBe("2026-12-05T00:00:00.000Z");
		expect(
			remunerationDueDate(new Date("2026-12-26T00:00:00Z")).toISOString(),
		).toBe("2027-02-05T00:00:00.000Z");
	});
	it("clamps missing due day to month end", () => {
		expect(
			remunerationDueDate(
				new Date("2027-01-25T00:00:00Z"),
				25,
				31,
			).toISOString(),
		).toBe("2027-02-28T00:00:00.000Z");
	});
	it("produces distinct valid CPF check digits", () => {
		const values = Array.from({ length: 15 }, (_, i) => seedCpf(i + 1));
		expect(new Set(values).size).toBe(15);
		for (const value of values) {
			expect(value).toMatch(/^\d{11}$/);
			for (let length = 9; length <= 10; length++) {
				const sum = [...value.slice(0, length)].reduce(
					(total, digit, i) => total + Number(digit) * (length + 1 - i),
					0,
				);
				expect(Number(value[length])).toBe(((sum * 10) % 11) % 10);
			}
		}
	});
});
