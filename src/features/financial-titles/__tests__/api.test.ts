import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ZodType } from "zod";

const mocks = vi.hoisted(() => ({
	generateReceivables: vi.fn(),
	generatePayables: vi.fn(),
	createReceivable: vi.fn(),
	createPayable: vi.fn(),
	middleware: [] as unknown[],
}));
vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => {
		let schema: ZodType;
		return {
			middleware(value: unknown) {
				mocks.middleware.push(value);
				return this;
			},
			validator(value: ZodType) {
				schema = value;
				return this;
			},
			handler:
				(handler: (args: unknown) => unknown) =>
				(args: { data: unknown; context: unknown }) =>
					handler({ ...args, data: schema.parse(args.data) }),
		};
	},
}));
vi.mock("@/shared/session/server", () => ({
	authMiddleware: "authenticated-session",
}));
vi.mock("../data/mutations", () => ({
	generateReceivablesFromRevenue: mocks.generateReceivables,
	generatePayablesFromExpense: mocks.generatePayables,
	createDirectReceivable: mocks.createReceivable,
	createDirectPayable: mocks.createPayable,
}));

import {
	createDirectPayableMutationOptions,
	createDirectReceivableMutationOptions,
	generatePayablesFromExpenseMutationOptions,
	generateReceivablesFromRevenueMutationOptions,
} from "../api/mutations";
import { FINANCIAL_TITLE_ERRORS } from "../constants/errors";

const title = {
	amount: 10,
	dueDate: "2026-12-01",
	analytic: "FEES",
	expectedPaymentMethod: "PIX",
	kind: "EXTRA",
};
const context = { session: { firm: { id: 7 }, person: { id: 500 } } };
const cases = [
	{
		name: "revenue generation",
		options: generateReceivablesFromRevenueMutationOptions,
		write: mocks.generateReceivables,
		input: { revenueId: 5, titles: [title] },
		failure: FINANCIAL_TITLE_ERRORS.GENERATE_FAILED,
	},
	{
		name: "expense generation",
		options: generatePayablesFromExpenseMutationOptions,
		write: mocks.generatePayables,
		input: { expenseId: 6, titles: [title] },
		failure: FINANCIAL_TITLE_ERRORS.GENERATE_FAILED,
	},
	{
		name: "direct receivable",
		options: createDirectReceivableMutationOptions,
		write: mocks.createReceivable,
		input: { ...title, debtorId: 30, notes: "Ajuste" },
		failure: FINANCIAL_TITLE_ERRORS.CREATE_FAILED,
	},
	{
		name: "direct payable",
		options: createDirectPayableMutationOptions,
		write: mocks.createPayable,
		input: { ...title, beneficiaryId: 30, notes: "Ajuste" },
		failure: FINANCIAL_TITLE_ERRORS.CREATE_FAILED,
	},
];

beforeEach(() => {
	for (const item of cases) {
		item.write.mockReset().mockResolvedValue({ success: true });
	}
});

describe("financial title server boundary", () => {
	it("registers authentication middleware for all four operations", () => {
		expect(mocks.middleware).toEqual(
			Array.from({ length: 4 }, () => ["authenticated-session"]),
		);
	});
	it.each(cases)(
		"passes trusted session and validated input for $name",
		async ({ options, write, input }) => {
			const result = await options().mutationFn?.(
				{ data: { ...input, firmId: 999, actorId: 999 }, context } as never,
				{} as never,
			);
			expect(result).toEqual({ success: true });
			expect(write).toHaveBeenCalledWith({ session: context.session, input });
		},
	);
	it.each(cases)(
		"rejects invalid input before $name",
		async ({ options, write }) => {
			await expect(async () =>
				options().mutationFn?.({ data: {}, context } as never, {} as never),
			).rejects.toThrow();
			expect(write).not.toHaveBeenCalled();
		},
	);
	it.each(cases)(
		"hides database errors from $name",
		async ({ options, write, input, failure }) => {
			const log = vi.spyOn(console, "error").mockImplementation(() => {});
			write.mockRejectedValueOnce(new Error("secret SQL connection details"));
			try {
				await expect(
					options().mutationFn?.(
						{ data: input, context } as never,
						{} as never,
					),
				).rejects.toThrow(failure);
				expect(log).toHaveBeenCalled();
			} finally {
				log.mockRestore();
			}
		},
	);
	it.each(cases)(
		"preserves safe business and permission errors for $name",
		async ({ options, write, input }) => {
			const log = vi.spyOn(console, "error").mockImplementation(() => {});
			try {
				for (const message of [
					FINANCIAL_TITLE_ERRORS.CLOSURE_BALANCE_MISMATCH,
					"Você não tem permissão para esta operação.",
				]) {
					write.mockRejectedValueOnce(new Error(message));
					await expect(
						options().mutationFn?.(
							{ data: input, context } as never,
							{} as never,
						),
					).rejects.toThrow(message);
				}
			} finally {
				log.mockRestore();
			}
		},
	);
});
