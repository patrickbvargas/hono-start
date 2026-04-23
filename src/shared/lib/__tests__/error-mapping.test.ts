import { describe, expect, it } from "vitest";
import {
	getErrorMessages,
	hasExactErrorMessage,
	isPrismaUniqueConstraintError,
} from "../error-mapping";

const catalog = {
	DUPLICATE: "Este documento já está cadastrado",
	FAILED: "Erro ao salvar",
} as const;

describe("safe error mapping", () => {
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
});
