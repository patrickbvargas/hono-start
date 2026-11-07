import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ZodType } from "zod";
import type { ClerkPermission, LoggedUserSession } from "@/shared/session";

const mocks = vi.hoisted(() => ({ financial: vi.fn() }));
const current = vi.hoisted(() => ({
	session: null as LoggedUserSession | null,
}));
vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => {
		let schema: ZodType | undefined;
		return {
			middleware() {
				return this;
			},
			validator(value: ZodType) {
				schema = value;
				return this;
			},
			handler:
				(handler: (args: unknown) => unknown) => (args: { data: unknown }) =>
					handler({
						...args,
						data: schema?.parse(args.data),
						context: { session: current.session },
					}),
		};
	},
}));
vi.mock("@/shared/session/server", () => ({
	authMiddleware: {},
	getRequiredServerLoggedUserSession: vi.fn(),
	getServerScope: vi.fn(),
}));
vi.mock("../data/queries", () => ({
	getExpenseFinancial: mocks.financial,
	getExpenseById: vi.fn(),
	getExpenses: vi.fn(),
	getExpenseSuppliers: vi.fn(),
}));

import { getExpenseFinancialQueryOptions } from "../api/queries";

const session = (permissions: ClerkPermission[]): LoggedUserSession => ({
	permissions,
	clerk: { userId: "u", organizationId: "o", sessionId: "s" },
	user: { fullName: "Admin", email: "admin@example.com" },
	employee: { id: 10 },
	person: { id: 100 },
	firm: { id: 7, name: "Matriz" },
	employeeType: { id: 1, value: "LAWYER", label: "Advogado" },
});

beforeEach(() =>
	mocks.financial
		.mockReset()
		.mockResolvedValue({ paidAmount: 0, remainingAmount: 0, installments: [] }),
);

async function request() {
	const options = getExpenseFinancialQueryOptions(9);
	// The Start test adapter supplies trusted context without a running server.
	const fn = options.queryFn as unknown as () => Promise<unknown>;
	return fn();
}

describe("expense financial authorization", () => {
	it("requires both operational and all-payables read authority", async () => {
		for (const grants of [
			[],
			["org:expenses:read"],
			["org:payables:read_all"],
			["org:expenses:read", "org:payables:read_own"],
		] as ClerkPermission[][]) {
			current.session = session(grants);
			await expect(request()).rejects.toThrow("permissão");
		}
		expect(mocks.financial).not.toHaveBeenCalled();
	});
	it("uses the authenticated Firm and requested expense only", async () => {
		current.session = session(["org:expenses:read", "org:payables:read_all"]);
		await request();
		expect(mocks.financial).toHaveBeenCalledWith({ firmId: 7, id: 9 });
	});
});
