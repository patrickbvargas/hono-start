import { describe, expect, it } from "vitest";
import { auditLogSearchSchema } from "@/features/audit-logs/schemas/search";
import { clientSearchSchema } from "@/features/clients/schemas/search";
import { contractSearchSchema } from "@/features/contracts/schemas/search";
import { dashboardSearchSchema } from "@/features/dashboard/schemas/search";
import { employeeSearchSchema } from "@/features/employees/schemas/search";
import { feeSearchSchema } from "@/features/fees/schemas/search";
import { remunerationSearchSchema } from "@/features/remunerations/schemas/search";

const entitySearchCases = [
	{
		name: "clients",
		schema: clientSearchSchema,
		defaults: {
			page: 1,
			limit: 25,
			column: "fullName",
			direction: "asc",
			query: "",
			type: [],
			active: "all",
			status: "active",
		},
		validColumn: "document",
		validFilters: {
			query: "  Maria  ",
			type: ["INDIVIDUAL"],
			active: "true",
			status: "deleted",
		},
		trimmedQuery: "Maria",
	},
	{
		name: "employees",
		schema: employeeSearchSchema,
		defaults: {
			page: 1,
			limit: 25,
			column: "fullName",
			direction: "asc",
			query: "",
			type: [],
			role: [],
			active: "all",
			status: "active",
		},
		validColumn: "oabNumber",
		validFilters: {
			query: "  OAB  ",
			type: ["LAWYER"],
			role: ["ADMIN"],
			active: "false",
			status: "all",
		},
		trimmedQuery: "OAB",
	},
	{
		name: "contracts",
		schema: contractSearchSchema,
		defaults: {
			page: 1,
			limit: 25,
			column: "createdAt",
			direction: "desc",
			clientId: "",
			legalArea: [],
			contractStatus: [],
			active: "all",
			status: "active",
		},
		validColumn: "processNumber",
		validFilters: {
			clientId: "42",
			legalArea: ["SOCIAL_SECURITY"],
			contractStatus: ["ACTIVE"],
			active: "true",
			status: "deleted",
		},
	},
	{
		name: "fees",
		schema: feeSearchSchema,
		defaults: {
			page: 1,
			limit: 25,
			column: "paymentDate",
			direction: "desc",
			contractId: "",
			revenueId: "",
			dateFrom: "",
			dateTo: "",
			active: "all",
			status: "active",
		},
		validColumn: "amount",
		validFilters: {
			contractId: "10",
			revenueId: "20",
			dateFrom: "2026-01-01",
			dateTo: "2026-01-31",
			active: "false",
			status: "all",
		},
	},
	{
		name: "remunerations",
		schema: remunerationSearchSchema,
		defaults: {
			page: 1,
			limit: 25,
			column: "paymentDate",
			direction: "desc",
			employeeId: "",
			contractId: "",
			dateFrom: "",
			dateTo: "",
			active: "all",
			status: "active",
		},
		validColumn: "employeeName",
		validFilters: {
			employeeId: "11",
			contractId: "22",
			dateFrom: "2026-02-01",
			dateTo: "2026-02-28",
			active: "true",
			status: "deleted",
		},
	},
	{
		name: "audit logs",
		schema: auditLogSearchSchema,
		defaults: {
			page: 1,
			limit: 25,
			column: "occurredAt",
			direction: "asc",
			action: [],
			entityType: [],
			actorName: [],
		},
		validColumn: "actorName",
		validFilters: {
			action: ["CREATE"],
			entityType: ["Client"],
			actorName: ["Maria"],
		},
	},
] as const;

describe("feature search contracts", () => {
	it.each(entitySearchCases)(
		"applies safe URL defaults for $name search",
		({ schema, defaults }) => {
			expect(schema.parse({})).toEqual(defaults);
		},
	);

	it.each(entitySearchCases)(
		"recovers invalid pagination and sorting for $name search",
		({ schema, defaults }) => {
			expect(
				schema.parse({
					page: "-5",
					limit: "0",
					column: "unsupported",
					direction: "sideways",
					active: "maybe",
					status: "removed",
				}),
			).toMatchObject({
				page: defaults.page,
				limit: defaults.limit,
				column: defaults.column,
				direction: defaults.direction,
			});
		},
	);

	it.each(entitySearchCases)(
		"accepts allowed sorting and filters for $name search",
		(searchCase) => {
			const { schema, validColumn, validFilters } = searchCase;
			const trimmedQuery =
				"trimmedQuery" in searchCase ? searchCase.trimmedQuery : undefined;
			const parsed = schema.parse({
				page: "3",
				limit: "50",
				column: validColumn,
				direction: "desc",
				...validFilters,
			});
			const expectedFilters = trimmedQuery
				? { ...validFilters, query: trimmedQuery }
				: validFilters;

			expect(parsed).toMatchObject({
				page: 3,
				limit: 50,
				column: validColumn,
				direction: "desc",
				...expectedFilters,
			});

			if (trimmedQuery) {
				expect(parsed).toMatchObject({ query: trimmedQuery });
			}
		},
	);

	it("keeps dashboard search defaults safe and validates dates", () => {
		expect(dashboardSearchSchema.parse({})).toEqual({
			dateFrom: "",
			dateTo: "",
			employeeId: "",
		});

		expect(() =>
			dashboardSearchSchema.parse({
				dateFrom: "not-a-date",
				dateTo: "",
				employeeId: "",
			}),
		).toThrow("Data inicial inválida");

		expect(() =>
			dashboardSearchSchema.parse({
				dateFrom: "2026-04-30",
				dateTo: "2026-04-01",
				employeeId: "",
			}),
		).toThrow("A data inicial deve ser anterior à data final");
	});
});
