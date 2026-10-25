import { describe, expect, it } from "vitest";
import { getFilterSearchUpdater } from "@/shared/hooks/use-filter";
import {
	pendingWorkSearchDefaults,
	pendingWorkSearchSchema,
} from "../schemas/search";

describe("pending work search", () => {
	it("validates sort columns and rejects obsolete creation-warning filters", () => {
		expect(
			pendingWorkSearchSchema.parse({ column: "client", direction: "desc" }),
		).toMatchObject({ column: "client", direction: "desc" });
		expect(
			pendingWorkSearchSchema.parse({
				column: "malicious SQL",
				type: ["no-revenues"],
			}),
		).toMatchObject({ column: "severity", type: [] });
	});
	it("accepts multiple severities and issue kinds together", () => {
		const search = pendingWorkSearchSchema.parse({
			severity: ["high", "medium"],
			type: ["overdue", "remaining-balance"],
		});
		expect(search.severity).toEqual(["high", "medium"]);
		expect(search.type).toEqual(["overdue", "remaining-balance"]);
	});
	it("normalizes invalid URL values and caps page size", () => {
		expect(
			pendingWorkSearchSchema.parse({
				severity: "urgent",
				type: "unknown",
				page: -1,
				limit: 10000,
				clientId: "no",
				employeeId: "-2",
			}),
		).toEqual(pendingWorkSearchDefaults);
	});
	it("preserves exact filters and resets pagination through shared orchestration", () => {
		const search = pendingWorkSearchSchema.parse({
			query: " PROC ",
			severity: "high",
			type: "overdue",
			clientId: "4",
			employeeId: "8",
			page: 5,
			limit: 10,
		});
		expect(search.query).toBe("PROC");
		expect(search.severity).toEqual(["high"]);
		expect(getFilterSearchUpdater({ severity: ["medium"] })(search)).toEqual({
			...search,
			severity: ["medium"],
			page: 1,
		});
	});
});
