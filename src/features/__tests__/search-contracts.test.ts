import { stripSearchParams } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { auditLogSearchSchema } from "@/features/audit-logs/schemas/search";
import { auditLogSearchDefaults } from "@/features/audit-logs/utils/default";
import { contractSearchSchema } from "@/features/contracts/schemas/search";
import { contractSearchDefaults } from "@/features/contracts/utils/default";
import { dashboardSearchSchema } from "@/features/dashboard/schemas/search";
import { dashboardSearchDefaults } from "@/features/dashboard/utils/default";

import { personSearchSchema } from "@/features/people/schemas/search";
import { personSearchDefaults } from "@/features/people/utils/default";

function applyStripSearchParams<T extends Record<string, unknown>>(
	defaults: T,
	search: T,
) {
	return stripSearchParams(defaults)({
		search,
		next: () => search,
	});
}

const entitySearchCases = [
	{
		name: "people",
		schema: personSearchSchema,
		defaults: personSearchDefaults,
		validColumn: "document",
		validFilters: {
			query: "  Maria  ",
			type: ["INDIVIDUAL"],
			active: "true",
			status: "deleted",
		},
		trimmedQuery: "Maria",
		nonDefaultSearch: {
			...personSearchDefaults,
			page: 3,
			column: "document",
			direction: "desc",
			query: "Maria",
			type: ["INDIVIDUAL"],
			active: "true",
		},
		expectedCanonicalSearch: {
			page: 3,
			column: "document",
			direction: "desc",
			query: "Maria",
			type: ["INDIVIDUAL"],
			active: "true",
		},
	},
	{
		name: "contracts",
		schema: contractSearchSchema,
		defaults: contractSearchDefaults,
		validColumn: "processNumber",
		validFilters: {
			query: "  PROC-001  ",
			clientId: "42",
			legalArea: ["SOCIAL_SECURITY"],
			contractStatus: ["ACTIVE"],
			active: "true",
			status: "deleted",
		},
		trimmedQuery: "PROC-001",
		nonDefaultSearch: {
			...contractSearchDefaults,
			page: 2,
			column: "processNumber",
			direction: "asc",
			query: "PROC-001",
			clientId: "42",
			contractStatus: ["ACTIVE"],
		},
		expectedCanonicalSearch: {
			page: 2,
			column: "processNumber",
			direction: "asc",
			query: "PROC-001",
			clientId: "42",
			contractStatus: ["ACTIVE"],
		},
	},

	{
		name: "audit logs",
		schema: auditLogSearchSchema,
		defaults: auditLogSearchDefaults,
		validColumn: "actorName",
		validFilters: {
			query: "  contrato  ",
			action: ["CREATE"],
			entityType: ["Client"],
			actorName: ["Maria"],
		},
		trimmedQuery: "contrato",
		nonDefaultSearch: {
			...auditLogSearchDefaults,
			page: 2,
			column: "actorName",
			direction: "desc",
			query: "contrato",
			action: ["CREATE"],
			entityType: ["Client"],
		},
		expectedCanonicalSearch: {
			page: 2,
			column: "actorName",
			direction: "desc",
			query: "contrato",
			action: ["CREATE"],
			entityType: ["Client"],
		},
	},
];

describe("feature search contracts", () => {
	it.each(entitySearchCases)(
		"applies safe URL defaults for $name search",
		({ name, schema, defaults }) => {
			expect(schema.parse({})).toEqual(
				name === "audit logs"
					? { ...defaults, column: "id", direction: "desc" }
					: defaults,
			);
		},
	);

	it.each(entitySearchCases)(
		"recovers invalid pagination and sorting for $name search",
		({ name, schema, defaults }) => {
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
				column: name === "audit logs" ? "id" : defaults.column,
				direction: name === "audit logs" ? "desc" : defaults.direction,
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

	it.each(entitySearchCases)(
		"strips default params and keeps non-default params for $name search",
		({ defaults, expectedCanonicalSearch, nonDefaultSearch, schema }) => {
			expect(applyStripSearchParams(defaults, defaults)).toEqual({});
			expect(applyStripSearchParams(defaults, nonDefaultSearch)).toEqual(
				expectedCanonicalSearch,
			);
			expect(schema.parse(expectedCanonicalSearch)).toEqual(nonDefaultSearch);
		},
	);

	it("keeps dashboard search defaults safe and validates dates", () => {
		const {
			clientId: _clientId,
			contractId: _contractId,
			...implicitDefaults
		} = dashboardSearchDefaults;
		expect(dashboardSearchSchema.parse({})).toEqual(implicitDefaults);
		expect(
			dashboardSearchSchema.parse({ clientId: "42", contractId: "7" }),
		).toMatchObject({ clientId: "42", contractId: "7" });
		expect(
			applyStripSearchParams(dashboardSearchDefaults, dashboardSearchDefaults),
		).toEqual({});

		const customDashboardSearch = {
			...dashboardSearchDefaults,
			dateFrom: "2026-04-01",
			dateTo: "2026-04-30",
		};

		expect(
			applyStripSearchParams(dashboardSearchDefaults, customDashboardSearch),
		).toEqual({
			dateFrom: "2026-04-01",
			dateTo: "2026-04-30",
		});
		expect(
			dashboardSearchSchema.parse({
				dateFrom: "2026-04-01",
				dateTo: "2026-04-30",
			}),
		).toEqual({
			...implicitDefaults,
			dateFrom: "2026-04-01",
			dateTo: "2026-04-30",
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
