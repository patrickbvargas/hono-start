import { describe, expect, it } from "vitest";
import { auditLogWorkspaceSearchSchema } from "../audit-logs/schemas/workspace";
import { clientWorkspaceSearchSchema } from "../clients/schemas/workspace";
import { employeeWorkspaceSearchSchema } from "../employees/schemas/workspace";
import { expenseWorkspaceSearchSchema } from "../expenses/schemas/workspace";
import { feeWorkspaceSearchSchema } from "../fees/schemas/workspace";
import { remunerationWorkspaceSearchSchema } from "../remunerations/schemas/workspace";

const schemas = [
	clientWorkspaceSearchSchema,
	employeeWorkspaceSearchSchema,
	expenseWorkspaceSearchSchema,
	feeWorkspaceSearchSchema,
	remunerationWorkspaceSearchSchema,
	auditLogWorkspaceSearchSchema,
];

describe("workspace navigation boundaries", () => {
	it("accepts meaningful contact, financial and audit sections", () => {
		expect(clientWorkspaceSearchSchema.parse({ tab: "contact" }).tab).toBe(
			"contact",
		);
		for (const schema of [
			employeeWorkspaceSearchSchema,
			feeWorkspaceSearchSchema,
			remunerationWorkspaceSearchSchema,
		]) {
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
			clientWorkspaceSearchSchema,
			employeeWorkspaceSearchSchema,
			expenseWorkspaceSearchSchema,
		]) {
			expect(schema.parse({ tab: "attachments" }).tab).toBe("attachments");
		}
		for (const schema of [
			feeWorkspaceSearchSchema,
			remunerationWorkspaceSearchSchema,
			auditLogWorkspaceSearchSchema,
		]) {
			expect(schema.parse({ tab: "attachments" }).tab).toBe("overview");
		}
	});
	it("preserves financial filters without introducing a new return contract", () => {
		const result = remunerationWorkspaceSearchSchema.parse({
			tab: "history",
			returnTo: {
				employeeId: "7",
				contractId: "42",
				dateFrom: "2026-10-01",
				dateTo: "2026-10-25",
				active: "all",
				status: "deleted",
			},
		});
		expect(result.tab).toBe("history");
		expect(result.returnTo).toMatchObject({
			employeeId: "7",
			contractId: "42",
			dateFrom: "2026-10-01",
			dateTo: "2026-10-25",
		});
	});
});
