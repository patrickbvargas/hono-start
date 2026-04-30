import { stripSearchParams } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { auditLogSearchSchema } from "@/features/audit-logs/schemas/search";
import { auditLogSearchDefaults } from "@/features/audit-logs/utils/default";
import { clientSearchSchema } from "@/features/clients/schemas/search";
import { clientSearchDefaults } from "@/features/clients/utils/default";
import { contractSearchSchema } from "@/features/contracts/schemas/search";
import { contractSearchDefaults } from "@/features/contracts/utils/default";
import { dashboardSearchSchema } from "@/features/dashboard/schemas/search";
import { dashboardSearchDefaults } from "@/features/dashboard/utils/default";
import { employeeSearchSchema } from "@/features/employees/schemas/search";
import { employeeSearchDefaults } from "@/features/employees/utils/default";
import { feeSearchSchema } from "@/features/fees/schemas/search";
import { feeSearchDefaults } from "@/features/fees/utils/default";
import { remunerationSearchSchema } from "@/features/remunerations/schemas/search";
import { remunerationSearchDefaults } from "@/features/remunerations/utils/default";

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
		name: "clients",
		schema: clientSearchSchema,
		defaults: clientSearchDefaults,
		validColumn: "document",
		validFilters: {
			query: "  Maria  ",
			type: ["INDIVIDUAL"],
			active: "true",
			status: "deleted",
		},
		trimmedQuery: "Maria",
		nonDefaultSearch: {
			...clientSearchDefaults,
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
		name: "employees",
		schema: employeeSearchSchema,
		defaults: employeeSearchDefaults,
		validColumn: "oabNumber",
		validFilters: {
			query: "  OAB  ",
			type: ["LAWYER"],
			role: ["ADMIN"],
			active: "false",
			status: "all",
		},
		trimmedQuery: "OAB",
		nonDefaultSearch: {
			...employeeSearchDefaults,
			page: 2,
			column: "oabNumber",
			direction: "desc",
			query: "OAB",
			type: ["LAWYER"],
			role: ["ADMIN"],
		},
		expectedCanonicalSearch: {
			page: 2,
			column: "oabNumber",
			direction: "desc",
			query: "OAB",
			type: ["LAWYER"],
			role: ["ADMIN"],
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
		name: "fees",
		schema: feeSearchSchema,
		defaults: feeSearchDefaults,
		validColumn: "amount",
		validFilters: {
			query: "  PROC-100  ",
			contractId: "10",
			revenueId: "20",
			dateFrom: "2026-01-01",
			dateTo: "2026-01-31",
			active: "false",
			status: "all",
		},
		trimmedQuery: "PROC-100",
		nonDefaultSearch: {
			...feeSearchDefaults,
			page: 4,
			column: "amount",
			direction: "asc",
			query: "PROC-100",
			contractId: "10",
			dateFrom: "2026-01-01",
		},
		expectedCanonicalSearch: {
			page: 4,
			column: "amount",
			direction: "asc",
			query: "PROC-100",
			contractId: "10",
			dateFrom: "2026-01-01",
		},
	},
	{
		name: "remunerations",
		schema: remunerationSearchSchema,
		defaults: remunerationSearchDefaults,
		validColumn: "employeeName",
		validFilters: {
			query: "  Maria  ",
			employeeId: "11",
			contractId: "22",
			dateFrom: "2026-02-01",
			dateTo: "2026-02-28",
			active: "true",
			status: "deleted",
		},
		trimmedQuery: "Maria",
		nonDefaultSearch: {
			...remunerationSearchDefaults,
			page: 5,
			column: "employeeName",
			direction: "asc",
			query: "Maria",
			employeeId: "11",
			dateTo: "2026-02-28",
		},
		expectedCanonicalSearch: {
			page: 5,
			column: "employeeName",
			direction: "asc",
			query: "Maria",
			employeeId: "11",
			dateTo: "2026-02-28",
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
		expect(dashboardSearchSchema.parse({})).toEqual(dashboardSearchDefaults);
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
		).toEqual(customDashboardSearch);

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
