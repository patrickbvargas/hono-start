import { describe, expect, it } from "vitest";
import { hasNonDefaultFilterValue } from "../use-filter";

describe("hasNonDefaultFilterValue", () => {
	it("returns false when selected fields match validated defaults", () => {
		const filter = {
			query: "abc",
			type: [],
			active: "all",
			status: "active",
		};
		const defaultFilter = {
			query: "",
			type: [],
			active: "all",
			status: "active",
		};

		expect(
			hasNonDefaultFilterValue(filter, defaultFilter, [
				"type",
				"active",
				"status",
			]),
		).toBe(false);
	});

	it("returns true when at least one selected field differs from default", () => {
		const filter = {
			query: "",
			type: ["COMPANY"],
			active: "all",
			status: "active",
		};
		const defaultFilter = {
			query: "",
			type: [],
			active: "all",
			status: "active",
		};

		expect(
			hasNonDefaultFilterValue(filter, defaultFilter, [
				"type",
				"active",
				"status",
			]),
		).toBe(true);
	});

	it("compares nested values deeply", () => {
		const filter = {
			range: {
				start: "2026-01-01",
				end: "2026-05-09",
			},
		};
		const defaultFilter = {
			range: {
				start: "2026-01-01",
				end: "2026-05-09",
			},
		};

		expect(hasNonDefaultFilterValue(filter, defaultFilter)).toBe(false);
	});
});
