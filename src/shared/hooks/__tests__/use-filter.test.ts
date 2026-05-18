import { describe, expect, it } from "vitest";
import {
	getFilterSearchUpdater,
	hasNonDefaultFilterValue,
} from "../use-filter";

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

describe("getFilterSearchUpdater", () => {
	it("merges current filter values and resets pagination to first page", () => {
		const nextSearch = getFilterSearchUpdater({
			query: "maria",
			type: ["COMPANY"],
			active: "all",
			status: "active",
		})({
			page: 3,
			pageSize: 20,
			sortBy: "fullName",
			sortDir: "desc",
			query: "",
			type: [],
			active: "false",
			status: "all",
		});

		expect(nextSearch).toEqual({
			page: 1,
			pageSize: 20,
			sortBy: "fullName",
			sortDir: "desc",
			query: "maria",
			type: ["COMPANY"],
			active: "all",
			status: "active",
		});
	});

	it("preserves non-filter route state while restoring default filter values", () => {
		const defaultFilter = {
			query: "",
			contractId: "",
			dateFrom: "",
			dateTo: "",
			active: "all",
			status: "active",
		};

		const nextSearch = getFilterSearchUpdater(defaultFilter)({
			page: 4,
			pageSize: 50,
			sortBy: "paymentDate",
			sortDir: "asc",
			layout: "cards",
			query: "123",
			contractId: "42",
			dateFrom: "2026-05-01",
			dateTo: "2026-05-31",
			active: "false",
			status: "all",
		});

		expect(nextSearch).toEqual({
			page: 1,
			pageSize: 50,
			sortBy: "paymentDate",
			sortDir: "asc",
			layout: "cards",
			query: "",
			contractId: "",
			dateFrom: "",
			dateTo: "",
			active: "all",
			status: "active",
		});
	});
});
