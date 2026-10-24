import { describe, expect, it } from "vitest";
import { formatter } from "./formatter";

describe("calendar date formatter", () => {
	it("preserves the entered day regardless of the machine timezone", () => {
		for (const value of [
			"2026-10-24",
			"2026-10-24T00:00:00.000Z",
			"2026-10-24T12:00:00.000Z",
		]) {
			expect(formatter.calendarDate(value)).toBe("24/10/2026");
		}
		expect(formatter.calendarDate(null)).toBe("—");
		expect(formatter.calendarDate("")).toBe("—");
	});
});

describe("phone formatter", () => {
	it("formats landlines and mobile numbers", () => {
		expect(formatter.phone("1133334444")).toBe("(11) 3333-4444");
		expect(formatter.phone("11987654321")).toBe("(11) 98765-4321");
		expect(formatter.phone("(11) 98765-4321")).toBe("(11) 98765-4321");
	});
	it("preserves unsupported values and handles missing numbers", () => {
		expect(formatter.phone(null)).toBe("—");
		expect(formatter.phone("")).toBe("—");
		expect(formatter.phone("123")).toBe("123");
	});
});
