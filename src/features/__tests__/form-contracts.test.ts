import { describe, expect, it } from "vitest";
import {
	clientCreateInputSchema,
	clientIdInputSchema,
	clientUpdateInputSchema,
} from "@/features/clients/schemas/form";
import {
	contractCreateInputSchema,
	contractIdInputSchema,
	contractUpdateInputSchema,
} from "@/features/contracts/schemas/form";
import {
	employeeCreateInputSchema,
	employeeIdInputSchema,
	employeeUpdateInputSchema,
} from "@/features/employees/schemas/form";
import {
	feeCreateInputSchema,
	feeIdInputSchema,
	feeUpdateInputSchema,
} from "@/features/fees/schemas/form";
import {
	remunerationExportInputSchema,
	remunerationIdInputSchema,
	remunerationUpdateInputSchema,
} from "@/features/remunerations/schemas/form";

const clientCreateInput = {
	fullName: "Maria Cliente",
	document: "529.982.247-25",
	email: "maria@example.com",
	phone: "11999999999",
	type: "INDIVIDUAL",
	isActive: true,
};

const employeeCreateInput = {
	fullName: "João Advogado",
	email: "joao@example.com",
	oabNumber: "SP123456",
	remunerationPercent: 0.3,
	referrerPercent: 0.1,
	type: "LAWYER",
	role: "ADMIN",
	isActive: true,
};

const contractCreateInput = {
	clientId: "1",
	processNumber: "0001234-56.2026.8.26.0001",
	legalArea: "SOCIAL_SECURITY",
	status: "ACTIVE",
	feePercentage: 0.3,
	notes: " Observação ",
	allowStatusChange: true,
	isActive: true,
	assignments: [
		{
			employeeId: "2",
			assignmentType: "RESPONSIBLE",
			isActive: true,
		},
	],
	revenues: [
		{
			type: "CONTRACTUAL",
			totalValue: 10000,
			downPaymentValue: 1000,
			paymentStartDate: "2026-01-15",
			totalInstallments: 10,
			isActive: true,
		},
	],
};

const feeCreateInput = {
	contractId: "3",
	revenueId: "5",
	paymentDate: "2026-01-15",
	amount: 1000,
	installmentNumber: 1,
	generatesRemuneration: true,
	isActive: true,
};

const remunerationUpdateInput = {
	id: 7,
	amount: 300,
	effectivePercentage: 0.3,
};

const idSchemaCases = [
	{ name: "client", schema: clientIdInputSchema },
	{ name: "employee", schema: employeeIdInputSchema },
	{ name: "contract", schema: contractIdInputSchema },
	{ name: "fee", schema: feeIdInputSchema },
	{ name: "remuneration", schema: remunerationIdInputSchema },
] as const;

const createSchemaCases = [
	{
		name: "client",
		schema: clientCreateInputSchema,
		input: clientCreateInput,
		expected: { ...clientCreateInput, document: "52998224725" },
	},
	{
		name: "employee",
		schema: employeeCreateInputSchema,
		input: employeeCreateInput,
		expected: employeeCreateInput,
	},
	{
		name: "contract",
		schema: contractCreateInputSchema,
		input: contractCreateInput,
		expected: { ...contractCreateInput, notes: "Observação" },
	},
	{
		name: "fee",
		schema: feeCreateInputSchema,
		input: feeCreateInput,
		expected: feeCreateInput,
	},
] as const;

const updateSchemaCases = [
	{
		name: "client",
		schema: clientUpdateInputSchema,
		input: { id: 1, ...clientCreateInput },
		expected: { id: 1, ...clientCreateInput, document: "52998224725" },
	},
	{
		name: "employee",
		schema: employeeUpdateInputSchema,
		input: { id: 2, ...employeeCreateInput },
		expected: { id: 2, ...employeeCreateInput },
	},
	{
		name: "contract",
		schema: contractUpdateInputSchema,
		input: { id: 3, ...contractCreateInput },
		expected: { id: 3, ...contractCreateInput, notes: "Observação" },
	},
	{
		name: "fee",
		schema: feeUpdateInputSchema,
		input: { id: 6, ...feeCreateInput },
		expected: { id: 6, ...feeCreateInput },
	},
	{
		name: "remuneration",
		schema: remunerationUpdateInputSchema,
		input: remunerationUpdateInput,
		expected: remunerationUpdateInput,
	},
] as const;

describe("feature form contracts", () => {
	it.each(idSchemaCases)("validates $name id inputs", ({ schema }) => {
		expect(schema.parse({ id: 1 })).toEqual({ id: 1 });
		expect(() => schema.parse({ id: 0 })).toThrow();
		expect(() => schema.parse({})).toThrow();
	});

	it.each(createSchemaCases)(
		"accepts and normalizes $name create input",
		({ schema, input, expected }) => {
			expect(schema.parse(input)).toEqual(expected);
		},
	);

	it.each(updateSchemaCases)(
		"requires identity for $name update input",
		({ schema, input, expected }) => {
			expect(schema.parse(input)).toEqual(expected);
			expect(() => schema.parse({ ...input, id: undefined })).toThrow();
		},
	);

	it("validates remuneration export request format and search input", () => {
		expect(
			remunerationExportInputSchema.parse({
				format: "spreadsheet",
				page: "2",
				limit: "50",
				column: "amount",
				direction: "desc",
				employeeId: "10",
				contractId: "20",
				dateFrom: "2026-01-01",
				dateTo: "2026-01-31",
				active: "true",
				status: "active",
			}),
		).toEqual({
			format: "spreadsheet",
			page: 2,
			limit: 50,
			column: "amount",
			direction: "desc",
			query: "",
			employeeId: "10",
			contractId: "20",
			dateFrom: "2026-01-01",
			dateTo: "2026-01-31",
			active: "true",
			status: "active",
		});

		expect(() =>
			remunerationExportInputSchema.parse({
				format: "xlsx",
			}),
		).toThrow();
	});
});
