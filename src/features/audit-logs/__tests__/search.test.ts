import { describe, expect, it } from "vitest";
import { auditLogSearchSchema } from "../schemas/search";

describe("auditLogSearchSchema", () => {
	it("should apply safe defaults for empty search params", () => {
		const result = auditLogSearchSchema.parse({});

		expect(result).toEqual({
			page: 1,
			limit: 25,
			column: "id",
			direction: "desc",
			query: "",
			action: [],
			entityType: [],
			actorName: [],
		});
	});

	it("should recover from invalid sort params", () => {
		const result = auditLogSearchSchema.parse({
			column: "unknown",
			direction: "sideways",
		});

		expect(result.column).toBe("id");
		expect(result.direction).toBe("desc");
	});
});
