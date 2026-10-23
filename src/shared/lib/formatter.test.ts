import { describe, expect, it } from "vitest";
import { formatter } from "./formatter";

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
