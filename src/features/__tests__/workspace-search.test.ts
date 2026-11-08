import { describe, expect, it } from "vitest";
import { auditLogWorkspaceSearchSchema } from "../audit-logs/schemas/workspace";
import { expenseWorkspaceSearchSchema } from "../expenses/schemas/workspace";

import { personWorkspaceSearchSchema } from "../people/schemas/workspace";

const schemas = [
	personWorkspaceSearchSchema,
	expenseWorkspaceSearchSchema,

	auditLogWorkspaceSearchSchema,
];

describe("workspace navigation boundaries", () => {
	it("accepts meaningful contact, financial and audit sections", () => {
		expect(personWorkspaceSearchSchema.parse({ tab: "contact" }).tab).toBe(
			"contact",
		);
		for (const schema of [personWorkspaceSearchSchema]) {
			expect(schema.parse({ tab: "finance" }).tab).toBe("finance");
		}
		expect(auditLogWorkspaceSearchSchema.parse({ tab: "changes" }).tab).toBe(
			"changes",
		);
		expect(auditLogWorkspaceSearchSchema.parse({ tab: "technical" }).tab).toBe(
			"technical",
		);
		expect(expenseWorkspaceSearchSchema.parse({ tab: "finance" }).tab).toBe(
			"overview",
		);
	});
	it.each(schemas)(
		"uses safe defaults and rejects arbitrary return URLs",
		(schema) => {
			expect(
				schema.parse({ tab: "unknown", returnTo: "https://external.invalid" }),
			).toEqual({ tab: "overview" });
			expect(schema.parse({})).toEqual({ tab: "overview" });
		},
	);
	it.each(schemas)(
		"retains validated collection state across serialization",
		(schema) => {
			const input = {
				tab: "overview",
				returnTo: {
					query: "Maria",
					page: 3,
					limit: 10,
					column: "id",
					direction: "asc",
					detailId: 999,
					arbitrary: "discard",
				},
			};
			const parsed = schema.parse(JSON.parse(JSON.stringify(input)));
			expect(parsed.returnTo).toMatchObject({
				query: "Maria",
				page: 3,
				limit: 10,
				direction: "asc",
			});
			expect(parsed.returnTo).not.toHaveProperty("detailId");
			expect(parsed.returnTo).not.toHaveProperty("arbitrary");
		},
	);
	it("accepts only existing attachment owner tabs", () => {
		for (const schema of [
			personWorkspaceSearchSchema,
			expenseWorkspaceSearchSchema,
		]) {
			expect(schema.parse({ tab: "attachments" }).tab).toBe("attachments");
		}
		expect(
			auditLogWorkspaceSearchSchema.parse({ tab: "attachments" }).tab,
		).toBe("overview");
	});
});
