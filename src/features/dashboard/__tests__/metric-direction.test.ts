import { describe, expect, it } from "vitest";
import { getChangeTone } from "../utils/metrics";

describe("metric comparison meaning", () => {
	it("treats expense growth as adverse without reversing the actual percentage", () => {
		expect(getChangeTone(10, true)).toBe("danger");
		expect(getChangeTone(-10, true)).toBe("success");
		expect(getChangeTone(0, true)).toBe("default");
		expect(getChangeTone(null, true)).toBe("default");
		expect(getChangeTone(10)).toBe("success");
	});
});
