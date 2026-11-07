import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ZodType } from "zod";
import type { LoggedUserSession } from "@/shared/session/schema";

const mocks = vi.hoisted(() => ({
	list: vi.fn(),
	detail: vi.fn(),
	options: vi.fn(),
	receipts: vi.fn(),
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
	getReceivables: mocks.list,
	getReceivableById: mocks.detail,
	getReceivableOptions: mocks.options,
	getReceivableReceipts: mocks.receipts,
}));

import {
	getReceivableByIdQueryOptions,
	getReceivableOptionsQueryOptions,
	getReceivableReceiptsQueryOptions,
	getReceivablesQueryOptions,
	receivableKeys,
} from "../api/queries";
import { receivableSearchSchema } from "../schemas/search";

async function execute(options: { queryFn?: unknown }) {
	return (options.queryFn as () => Promise<unknown>)();
}
beforeEach(() => {
	vi.clearAllMocks();
	vi.spyOn(console, "error").mockImplementation(() => {});
	mocks.session = {
		permissions: ["org:receivables:read_assigned"],
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
		isAssignedToActor: true,
	});
	mocks.receipts.mockResolvedValue([]);
});
describe("receivable server boundaries", () => {
	it("requires authentication on every endpoint", () => {
		expect(mocks.middleware).toEqual(
			Array.from({ length: 4 }, () => ["authenticated"]),
		);
	});
	it("denies missing grants before reading any list, options or detail", async () => {
		mocks.session.permissions = [];
		for (const options of [
			getReceivablesQueryOptions(receivableSearchSchema.parse({})),
			getReceivableOptionsQueryOptions(),
			getReceivableByIdQueryOptions(2),
		]) {
			await expect(execute(options)).rejects.toThrow();
		}
		expect(mocks.list).not.toHaveBeenCalled();
		expect(mocks.detail).not.toHaveBeenCalled();
		expect(mocks.options).not.toHaveBeenCalled();
	});
	it("forwards trusted session and validated search instead of client scope", async () => {
		await execute(
			getReceivablesQueryOptions({
				...receivableSearchSchema.parse({}),
				firmId: 99,
				detailId: 7,
			} as never),
		);
		expect(mocks.list).toHaveBeenCalledWith(
			mocks.session,
			receivableSearchSchema.parse({}),
		);
		expect(
			receivableKeys.list({
				...receivableSearchSchema.parse({}),
				detailId: 7,
			} as never),
		).toEqual(receivableKeys.list(receivableSearchSchema.parse({})));
	});
	it("does not expose receipt events through title read authority", async () => {
		await expect(
			execute(getReceivableReceiptsQueryOptions(2)),
		).rejects.toThrow();
		expect(mocks.receipts).not.toHaveBeenCalled();
	});
	it("requires actual assignment for scoped receipt grants even with all-title authority", async () => {
		mocks.session.permissions = [
			"org:receivables:read_all",
			"org:receipts:read_assigned",
		];
		mocks.detail.mockResolvedValue({
			id: 2,
			contractId: 10,
			isAssignedToActor: false,
		});
		await expect(
			execute(getReceivableReceiptsQueryOptions(2)),
		).rejects.toThrow();
		expect(mocks.receipts).not.toHaveBeenCalled();
		mocks.detail.mockResolvedValue({
			id: 2,
			contractId: 10,
			isAssignedToActor: true,
		});
		await expect(
			execute(getReceivableReceiptsQueryOptions(2)),
		).resolves.toEqual([]);
	});
	it("blocks direct titles for assigned receipt access and permits explicit all-receipt access", async () => {
		mocks.session.permissions = [
			"org:receivables:read_all",
			"org:receipts:read_assigned",
		];
		mocks.detail.mockResolvedValue({
			id: 2,
			contractId: null,
			isAssignedToActor: false,
		});
		await expect(
			execute(getReceivableReceiptsQueryOptions(2)),
		).rejects.toThrow();
		mocks.session.permissions.push("org:receipts:read_all");
		await expect(
			execute(getReceivableReceiptsQueryOptions(2)),
		).resolves.toEqual([]);
	});
	it("returns safe detail errors", async () => {
		mocks.detail.mockRejectedValue(new Error("SQL secret"));
		await expect(execute(getReceivableByIdQueryOptions(2))).rejects.toThrow(
			"Título não encontrado ou indisponível para consulta.",
		);
	});
});
