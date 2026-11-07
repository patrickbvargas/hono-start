import { describe, expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import { FINANCIAL_TITLE_ERRORS } from "../constants/errors";
import { assertClosureBalance } from "../rules/balance";
import { assertCounterpartyActive } from "../rules/counterparty";
import {
	directPayableCreateInputSchema,
	directReceivableCreateInputSchema,
	expensePayableGenerationInputSchema,
	revenueReceivableGenerationInputSchema,
	titleInputSchema,
} from "../schemas/form";

const title = {
	amount: 0.1,
	dueDate: "2026-12-31",
	analytic: "FEES",
	expectedPaymentMethod: "PIX",
	kind: "INSTALLMENT",
} as const;

describe("financial title input", () => {
	it.each(["", [], undefined, 123])(
		"shows understandable Portuguese for invalid single selections: %s",
		(value) => {
			for (const [field, message] of [
				["expectedPaymentMethod", "Forma de pagamento é obrigatória"],
				["analytic", "Categoria financeira é obrigatória"],
			]) {
				const result = titleInputSchema.safeParse({ ...title, [field]: value });
				expect(result.success).toBe(false);
				if (!result.success) {
					expect([
						...new Set(result.error.issues.map((issue) => issue.message)),
					]).toEqual([message]);
				}
			}
		},
	);
	it.each([
		0,
		-1,
		1.001,
		Number.NaN,
		Number.POSITIVE_INFINITY,
		1_000_000_000_000,
	])("rejects invalid amount %s", (amount) => {
		expect(titleInputSchema.safeParse({ ...title, amount }).success).toBe(
			false,
		);
	});
	it.each(["2026-02-30", "2026-13-01", "2026-01-01T12:00:00Z", ""])(
		"rejects invalid date %s",
		(dueDate) => {
			expect(titleInputSchema.safeParse({ ...title, dueDate }).success).toBe(
				false,
			);
		},
	);
	it.each(["DOWN_PAYMENT", "INSTALLMENT", "EXTRA"])(
		"accepts kind %s and future due dates",
		(kind) => {
			expect(
				titleInputSchema.safeParse({ ...title, kind, dueDate: "2099-01-01" })
					.success,
			).toBe(true);
		},
	);
	it("rejects unknown kinds, empty catalogs, fractional IDs and empty plans", () => {
		expect(
			titleInputSchema.safeParse({ ...title, kind: "OTHER" }).success,
		).toBe(false);
		expect(
			titleInputSchema.safeParse({ ...title, analytic: " " }).success,
		).toBe(false);
		expect(
			titleInputSchema.safeParse({ ...title, expectedPaymentMethod: " " })
				.success,
		).toBe(false);
		for (const revenueId of [0, -1, 1.5]) {
			expect(
				revenueReceivableGenerationInputSchema.safeParse({
					revenueId,
					titles: [title],
				}).success,
			).toBe(false);
		}
		expect(
			revenueReceivableGenerationInputSchema.safeParse({
				revenueId: 1,
				titles: [],
			}).success,
		).toBe(false);
		expect(
			expensePayableGenerationInputSchema.safeParse({
				expenseId: 1,
				titles: [],
			}).success,
		).toBe(false);
	});
	it("requires trimmed justification for both direct directions", () => {
		for (const notes of [undefined, "", "   "]) {
			expect(
				directReceivableCreateInputSchema.safeParse({
					...title,
					debtorId: 1,
					notes,
				}).success,
			).toBe(false);
			expect(
				directPayableCreateInputSchema.safeParse({
					...title,
					beneficiaryId: 1,
					notes,
				}).success,
			).toBe(false);
		}
		expect(
			directReceivableCreateInputSchema.parse({
				...title,
				debtorId: 1,
				notes: "  Ajuste  ",
			}).notes,
		).toBe("Ajuste");
	});
	it("does not accept tenant or actor authority from input", () => {
		const parsed = revenueReceivableGenerationInputSchema.parse({
			revenueId: 1,
			titles: [title],
			firmId: 999,
			actorId: 999,
		});
		expect(parsed).not.toHaveProperty("firmId");
		expect(parsed).not.toHaveProperty("actorId");
	});
});

describe("closure balance", () => {
	it("adds decimal cents exactly", () => {
		expect(() =>
			assertClosureBalance(new Prisma.Decimal("0.30"), [
				{ amount: 0.1 },
				{ amount: 0.2 },
			]),
		).not.toThrow();
	});
	it.each(["0.29", "0.31"])("rejects one cent difference from %s", (amount) => {
		expect(() =>
			assertClosureBalance(new Prisma.Decimal(amount), [
				{ amount: 0.1 },
				{ amount: 0.2 },
			]),
		).toThrow(FINANCIAL_TITLE_ERRORS.CLOSURE_BALANCE_MISMATCH);
	});
});

describe("counterparty", () => {
	it("requires active profile and non-deleted active person", () => {
		const profile = {
			isActive: true,
			person: { isActive: true, deletedAt: null },
		};
		expect(() => assertCounterpartyActive(profile)).not.toThrow();
		for (const invalid of [
			null,
			{ ...profile, isActive: false },
			{ ...profile, person: { isActive: false, deletedAt: null } },
			{ ...profile, person: { isActive: true, deletedAt: new Date() } },
		]) {
			expect(() => assertCounterpartyActive(invalid)).toThrow(
				FINANCIAL_TITLE_ERRORS.COUNTERPARTY_UNAVAILABLE,
			);
		}
	});
});
