import { describe, expect, it } from "vitest";
import { entityDetailSearchSchema } from "./entity-detail-search";

describe("entity detail URL selection", () => {
	it("accepts persisted record IDs from URLs", () => {
		expect(entityDetailSearchSchema.parse({ detailId: "42" })).toEqual({
			detailId: 42,
		});
		expect(entityDetailSearchSchema.parse({})).toEqual({});
	});

	it.each([
		"invalid",
		"",
		"0",
		"-1",
		"1.5",
		Infinity,
		Number.MAX_SAFE_INTEGER + 1,
	])("ignores invalid selection %s", (detailId) => {
		expect(
			entityDetailSearchSchema.parse({ detailId }).detailId,
		).toBeUndefined();
	});
});
