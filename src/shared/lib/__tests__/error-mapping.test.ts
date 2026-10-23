import { describe, expect, it } from "vitest";
import {
	getErrorMessages,
	hasExactErrorMessage,
	hasSafeMutationErrorMessage,
	isPrismaUniqueConstraintError,
} from "../error-mapping";

const catalog = {
	DUPLICATE: "Este documento já está cadastrado",
	FAILED: "Erro ao salvar",
} as const;

describe("safe error mapping", () => {
	it("preserves permission errors and rejects unexpected internal errors", () => {
		expect(
			hasSafeMutationErrorMessage(
				new Error("Você não tem permissão para esta operação."),
				catalog,
			),
		).toBe(true);
		expect(
			hasSafeMutationErrorMessage(
				new Error("Conta sem colaborador vinculado para esta operação."),
				catalog,
			),
		).toBe(true);
		expect(
			hasSafeMutationErrorMessage(new Error("SQL connection failed"), catalog),
		).toBe(false);
	});

	it.each([
		["employees_firmId_oabNumber_key", ["firmId", "oabNumber"]],
		["contracts_firmId_processNumber_key", ["firmId", "processNumber"]],
		[
			"contract_employees_contractId_employeeId_active_key",
			["contractId", "employeeId"],
		],
		["revenues_contractId_typeId_active_key", ["contractId", "typeId"]],
		[
			"fees_revenueId_installmentNumber_active_key",
			["revenueId", "installmentNumber"],
		],
		[
			"remunerations_feeId_contractEmployeeId_active_key",
			["feeId", "contractEmployeeId"],
		],
	] as const)(
		"recognizes constraint %s across adapter formats",
		(index, fields) => {
			expect(
				isPrismaUniqueConstraintError(
					{ code: "P2002", meta: { target: index } },
					fields,
				),
			).toBe(true);
			expect(
				isPrismaUniqueConstraintError(
					{
						code: "P2002",
						meta: { driverAdapterError: { cause: { constraint: { index } } } },
					},
					fields,
				),
			).toBe(true);
			expect(
				isPrismaUniqueConstraintError(
					{
						code: "P2002",
						meta: { driverAdapterError: { cause: { constraint: { fields } } } },
					},
					fields,
				),
			).toBe(true);
		},
	);

	it("does not match fields from invocation text or partial names", () => {
		const error = Object.assign(
			new Error(
				'data: { firmId_document: "value" }; Unique constraint failed on the constraint: `other_firmId_documentExtra_key`',
			),
			{ code: "P2002" },
		);
		expect(isPrismaUniqueConstraintError(error, ["firmId", "document"])).toBe(
			false,
		);
	});
	it("reads messages from arrays and feature-local catalogs", () => {
		expect(getErrorMessages(["A", "B"])).toEqual(["A", "B"]);
		expect(getErrorMessages(catalog)).toEqual([
			"Este documento já está cadastrado",
			"Erro ao salvar",
		]);
	});

	it("matches only exact safe error messages", () => {
		expect(
			hasExactErrorMessage(
				new Error("Este documento já está cadastrado"),
				catalog,
			),
		).toBe(true);
		expect(
			hasExactErrorMessage(
				new Error("Este documento já está cadastrado: SQL detail"),
				catalog,
			),
		).toBe(false);
		expect(hasExactErrorMessage("Erro ao salvar", catalog)).toBe(false);
	});

	it("detects Prisma unique constraint errors for the expected target fields", () => {
		const error = {
			code: "P2002",
			meta: {
				target: ["firmId", "document"],
			},
		};

		expect(isPrismaUniqueConstraintError(error, ["firmId", "document"])).toBe(
			true,
		);
		expect(isPrismaUniqueConstraintError(error, ["firmId", "email"])).toBe(
			false,
		);
		expect(isPrismaUniqueConstraintError(new Error("P2002"), ["firmId"])).toBe(
			false,
		);
		expect(isPrismaUniqueConstraintError({ code: "P2002" }, ["firmId"])).toBe(
			false,
		);
	});

	it("detects adapter errors that report the constraint only in the message", () => {
		const error = Object.assign(
			new Error(
				"Unique constraint failed on the constraint: `clients_firmId_document_key`",
			),
			{ code: "P2002" },
		);

		expect(isPrismaUniqueConstraintError(error, ["firmId", "document"])).toBe(
			true,
		);
	});
});
