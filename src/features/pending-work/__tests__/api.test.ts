import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	session: vi.fn(),
	scope: vi.fn(),
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
		handler: (fn: unknown) => fn,
	}),
}));
vi.mock("@/shared/session/server", () => ({
	authMiddleware: {},
	getRequiredServerLoggedUserSession: mocks.session,
	getServerScope: mocks.scope,
}));
vi.mock("../data/queries", () => ({ getPendingWork: mocks.read }));

import { getPendingWorkQueryOptions } from "../api/queries";
import { pendingWorkSearchDefaults } from "../schemas/search";

describe("pending work server authorization", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// All-contract scope intentionally omits the binding; financial scope still needs it.
		mocks.scope.mockResolvedValue({ firmId: 7 });
		mocks.read.mockResolvedValue({ data: [] });
	});
	it("denies requests before the database when contract permission is absent", async () => {
		mocks.session.mockResolvedValue({
			employee: { id: 9 },
			permissions: ["org:fees:read_all"],
		});
		const options = getPendingWorkQueryOptions(pendingWorkSearchDefaults);
		await expect(
			options.queryFn?.({ data: pendingWorkSearchDefaults } as never),
		).rejects.toThrow("Não foi possível carregar as pendências");
		expect(mocks.read).not.toHaveBeenCalled();
	});
	it("uses authenticated firm/binding and independent subject grants", async () => {
		mocks.session.mockResolvedValue({
			employee: { id: 9 },
			permissions: ["org:contracts:read_all", "org:fees:read_assigned"],
			employeeType: { value: "LAWYER" },
		});
		const options = getPendingWorkQueryOptions(pendingWorkSearchDefaults);
		await options.queryFn?.({ data: pendingWorkSearchDefaults } as never);
		expect(mocks.read).toHaveBeenCalledWith({
			search: pendingWorkSearchDefaults,
			scope: {
				firmId: 7,
				employeeId: 9,
				employeeTypeValue: "LAWYER",
				allContracts: true,
				allFees: false,
				assignedFees: true,
			},
		});
		expect(options.meta).toEqual({ refreshOnMutation: true });
	});
});
