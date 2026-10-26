import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	permissions: [] as string[],
	read: vi.fn(),
}));
vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => ({
		middleware() {
			return this;
		},
		validator() {
			return this;
		},
		handler(fn: (args: unknown) => unknown) {
			return (args: { data: unknown }) =>
				fn({
					...args,
					context: {
						session: {
							employee: { id: 14 },
							firm: { id: 7 },
							permissions: mocks.permissions,
						},
					},
				});
		},
	}),
}));
vi.mock("@/shared/session/server", () => ({ authMiddleware: {} }));
vi.mock("../data/queries", () => ({
	getEmployeeFinance: mocks.read,
	getEmployeeById: vi.fn(),
	getEmployees: vi.fn(),
	getEmployeeTypes: vi.fn(),
}));

import { getEmployeeFinanceQueryOptions } from "../api/queries";

beforeEach(() => {
	vi.clearAllMocks();
	mocks.read.mockResolvedValue({
		totalAmount: 0,
	});
});
describe("employee finance authorization", () => {
	it.each(["org:employees:read", "org:remunerations:read_all"])(
		"requires %s before reading financial data",
		async (missing) => {
			mocks.permissions = [
				"org:employees:read",

				"org:remunerations:read_all",
			].filter((p) => p !== missing);
			const opts = getEmployeeFinanceQueryOptions(14);
			await expect(opts.queryFn?.({} as never)).rejects.toThrow(
				"Erro ao buscar resumo financeiro do colaborador",
			);
			expect(mocks.read).not.toHaveBeenCalled();
		},
	);
	it("uses authenticated firm and marks aggregates for mutation refresh", async () => {
		mocks.permissions = [
			"org:employees:read",

			"org:remunerations:read_all",
		];
		const opts = getEmployeeFinanceQueryOptions(14);
		await opts.queryFn?.({} as never);
		expect(mocks.read).toHaveBeenCalledWith({ firmId: 7, id: 14 });
		expect(opts.meta).toEqual({ refreshOnMutation: true });
	});
});

it("allows own totals only for the bound employee", async () => {
	mocks.permissions = ["org:employees:read", "org:remunerations:read_own"];
	await getEmployeeFinanceQueryOptions(14).queryFn?.({} as never);
	expect(mocks.read).toHaveBeenCalledWith({ firmId: 7, id: 14 });
	mocks.read.mockClear();
	await expect(
		getEmployeeFinanceQueryOptions(15).queryFn?.({} as never),
	).rejects.toThrow();
	expect(mocks.read).not.toHaveBeenCalled();
});
