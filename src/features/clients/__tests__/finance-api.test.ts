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
							employee: { id: null },
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
	getClientFinance: mocks.read,
	getClientById: vi.fn(),
	getClients: vi.fn(),
	getClientTypes: vi.fn(),
}));

import { getClientFinanceQueryOptions } from "../api/queries";

beforeEach(() => {
	vi.clearAllMocks();
	mocks.read.mockResolvedValue({
		totalValue: 0,
		paidValue: 0,
		remainingValue: 0,
	});
});
describe("client finance authorization", () => {
	it.each(["org:clients:read", "org:contracts:read_all", "org:fees:read_all"])(
		"requires %s before reading financial data",
		async (missing) => {
			mocks.permissions = [
				"org:clients:read",
				"org:contracts:read_all",
				"org:fees:read_all",
			].filter((p) => p !== missing);
			const opts = getClientFinanceQueryOptions(14);
			await expect(opts.queryFn?.({} as never)).rejects.toThrow(
				"Erro ao buscar resumo financeiro do cliente",
			);
			expect(mocks.read).not.toHaveBeenCalled();
		},
	);
	it("uses authenticated firm and marks aggregates for mutation refresh", async () => {
		mocks.permissions = [
			"org:clients:read",
			"org:contracts:read_all",
			"org:fees:read_all",
		];
		const opts = getClientFinanceQueryOptions(14);
		await opts.queryFn?.({} as never);
		expect(mocks.read).toHaveBeenCalledWith({ firmId: 7, id: 14 });
		expect(opts.meta).toEqual({ refreshOnMutation: true });
	});
});
