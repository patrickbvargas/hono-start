import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ZodType } from "zod";
import type { LoggedUserSession } from "@/shared/session/schema";

const mocks = vi.hoisted(() => ({
	list: vi.fn(),
	detail: vi.fn(),
	options: vi.fn(),
	payments: vi.fn(),
	middleware: [] as unknown[],
	session: {} as LoggedUserSession,
}));
vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => {
		let schema: ZodType | undefined;
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
				(handler: (args: unknown) => unknown) => (args?: { data?: unknown }) =>
					handler({
						data: schema?.parse(args?.data),
						context: { session: mocks.session },
					}),
		};
	},
}));
vi.mock("@/shared/session/server", () => ({ authMiddleware: "authenticated" }));
vi.mock("../data/queries", () => ({
	getPayables: mocks.list,
	getPayableById: mocks.detail,
	getPayableOptions: mocks.options,
	getPayablePayments: mocks.payments,
}));

import {
	getPayableByIdQueryOptions,
	getPayableOptionsQueryOptions,
	getPayablePaymentsQueryOptions,
	getPayablesQueryOptions,
	payableKeys,
} from "../api/queries";
import { payableSearchSchema } from "../schemas/search";

async function execute(options: { queryFn?: unknown }) {
	return (options.queryFn as () => Promise<unknown>)();
}
beforeEach(() => {
	vi.clearAllMocks();
	vi.spyOn(console, "error").mockImplementation(() => {});
	mocks.session = {
		permissions: ["org:payables:read_own"],
		person: { id: 71 },
		employee: { id: 7 },
		employeeType: { id: 1, value: "LAWYER", label: "Advogado" },
		firm: { id: 1, name: "Matriz" },
		user: { fullName: "Teste", email: "test@example.com" },
		clerk: {
			userId: "user_test",
			organizationId: "org_test",
			sessionId: "sess_test",
		},
	};
	mocks.list.mockResolvedValue({ data: [] });
	mocks.options.mockResolvedValue({});
	mocks.detail.mockResolvedValue({
		id: 2,
		contractId: 10,
		beneficiaryPersonId: 71,
		isRemuneration: true,
		isAssignedToActor: true,
	});
	mocks.payments.mockResolvedValue([]);
});
describe("payable server boundaries", () => {
	it("requires authentication on every endpoint", () => {
		expect(mocks.middleware).toEqual(
			Array.from({ length: 4 }, () => ["authenticated"]),
		);
	});
	it("denies missing grants before reading any list, options or detail", async () => {
		mocks.session.permissions = [];
		for (const options of [
			getPayablesQueryOptions(payableSearchSchema.parse({})),
			getPayableOptionsQueryOptions(),
			getPayableByIdQueryOptions(2),
		]) {
			await expect(execute(options)).rejects.toThrow();
		}
		expect(mocks.list).not.toHaveBeenCalled();
		expect(mocks.detail).not.toHaveBeenCalled();
		expect(mocks.options).not.toHaveBeenCalled();
	});
	it("forwards trusted session and validated search instead of client scope", async () => {
		await execute(
			getPayablesQueryOptions({
				...payableSearchSchema.parse({}),
				firmId: 99,
				detailId: 7,
			} as never),
		);
		expect(mocks.list).toHaveBeenCalledWith(
			mocks.session,
			payableSearchSchema.parse({}),
		);
		expect(
			payableKeys.list({
				...payableSearchSchema.parse({}),
				detailId: 7,
			} as never),
		).toEqual(payableKeys.list(payableSearchSchema.parse({})));
	});
	it("does not expose payment events through title read authority", async () => {
		await expect(execute(getPayablePaymentsQueryOptions(2))).rejects.toThrow();
		expect(mocks.payments).not.toHaveBeenCalled();
	});
	it("requires actual assignment for scoped payment grants even with all-title authority", async () => {
		mocks.session.permissions = [
			"org:payables:read_all",
			"org:payments:read_own",
		];
		mocks.detail.mockResolvedValue({
			id: 2,
			contractId: 10,
			beneficiaryPersonId: 71,
			isRemuneration: true,
			isAssignedToActor: false,
		});
		await expect(execute(getPayablePaymentsQueryOptions(2))).rejects.toThrow();
		expect(mocks.payments).not.toHaveBeenCalled();
		mocks.detail.mockResolvedValue({
			id: 2,
			contractId: 10,
			beneficiaryPersonId: 71,
			isRemuneration: true,
			isAssignedToActor: true,
		});
		await expect(execute(getPayablePaymentsQueryOptions(2))).resolves.toEqual(
			[],
		);
	});
	it("blocks direct titles for assigned payment access and permits explicit all-payment access", async () => {
		mocks.session.permissions = [
			"org:payables:read_all",
			"org:payments:read_own",
		];
		mocks.detail.mockResolvedValue({
			id: 2,
			contractId: null,
			isAssignedToActor: false,
		});
		await expect(execute(getPayablePaymentsQueryOptions(2))).rejects.toThrow();
		mocks.session.permissions.push("org:payments:read_all");
		await expect(execute(getPayablePaymentsQueryOptions(2))).resolves.toEqual(
			[],
		);
	});
	it("returns safe detail errors", async () => {
		mocks.detail.mockRejectedValue(new Error("SQL secret"));
		await expect(execute(getPayableByIdQueryOptions(2))).rejects.toThrow(
			"Título não encontrado ou indisponível para consulta.",
		);
	});
	it("denies another beneficiary even when assigned to the same contract", async () => {
		mocks.session.permissions = [
			"org:payables:read_all",
			"org:payments:read_own",
		];
		mocks.detail.mockResolvedValue({
			contractId: 10,
			beneficiaryPersonId: 99,
			isRemuneration: true,
			isAssignedToActor: true,
		});
		await expect(execute(getPayablePaymentsQueryOptions(2))).rejects.toThrow();
		expect(mocks.payments).not.toHaveBeenCalled();
	});
});
