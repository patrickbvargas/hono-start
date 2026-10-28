import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	session: vi.fn(),
	scope: vi.fn(),
	access: vi.fn(),
	list: vi.fn(),
	detail: vi.fn(),
	history: vi.fn(),
	actions: vi.fn(),
	actors: vi.fn(),
	types: vi.fn(),
}));
vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => ({
		middleware() {
			return this;
		},
		validator() {
			return this;
		},
		handler: (handler: (input: unknown) => unknown) => handler,
	}),
}));
vi.mock("@/shared/session/server", () => ({
	authMiddleware: {},
	getRequiredServerLoggedUserSession: mocks.session,
	getServerScope: mocks.scope,
}));
vi.mock("../data/access", () => ({ getAuditAccessWhere: mocks.access }));
vi.mock("../data/queries", () => ({
	getAuditLogs: mocks.list,
	getAuditLogById: mocks.detail,
	getAuditHistory: mocks.history,
	getAuditLogActions: mocks.actions,
	getAuditLogActors: mocks.actors,
	getAuditLogEntityTypes: mocks.types,
}));

import {
	getAuditHistoryQueryOptions,
	getAuditLogActionsQueryOptions,
	getAuditLogActorsQueryOptions,
	getAuditLogByIdQueryOptions,
	getAuditLogEntityTypesQueryOptions,
	getAuditLogsQueryOptions,
} from "../api/queries";
import { auditLogSearchSchema } from "../schemas/search";

const accessWhere = {
	OR: [{ firmId: 2, entityType: "Contract", entityId: "7" }],
};
const search = auditLogSearchSchema.parse({ query: "other", entityId: 99 });
const cases = [
	{
		name: "list",
		options: () => getAuditLogsQueryOptions(search),
		read: mocks.list,
		args: [{ firmId: 2, search, accessWhere }],
	},
	{
		name: "direct detail",
		options: () => getAuditLogByIdQueryOptions(99),
		read: mocks.detail,
		args: [{ firmId: 2, id: 99, accessWhere }],
	},
	{
		name: "history for another entity",
		options: () =>
			getAuditHistoryQueryOptions({ entityType: "Contract", entityId: 99 }),
		read: mocks.history,
		args: [{ firmId: 2, entityType: "Contract", entityId: 99, accessWhere }],
	},
	{
		name: "actions",
		options: getAuditLogActionsQueryOptions,
		read: mocks.actions,
		args: [2, accessWhere],
	},
	{
		name: "actors",
		options: getAuditLogActorsQueryOptions,
		read: mocks.actors,
		args: [2, accessWhere],
	},
	{
		name: "types",
		options: getAuditLogEntityTypesQueryOptions,
		read: mocks.types,
		args: [2, accessWhere],
	},
];
beforeEach(() => {
	vi.clearAllMocks();
	mocks.session.mockResolvedValue({
		employee: { id: 10 },
		firm: { id: 2 },
		permissions: ["org:audit_logs:read"],
	});
	mocks.scope.mockResolvedValue({ firmId: 2 });
	mocks.access.mockResolvedValue(accessWhere);
});

it.each(cases)(
	"enforces server-derived subject scope on $name",
	async ({ options, read, args }) => {
		await options().queryFn?.({} as never);
		expect(mocks.access).toHaveBeenCalledWith(
			await mocks.session.mock.results[0].value,
		);
		expect(read).toHaveBeenCalledWith(...args);
	},
);

it.each(cases)(
	"rejects $name before reading data when audit grant is absent",
	async ({ options, read }) => {
		mocks.session.mockResolvedValue({
			employee: { id: 10 },
			firm: { id: 2 },
			permissions: [],
		});
		const log = vi.spyOn(console, "error").mockImplementation(() => {});
		try {
			await expect(options().queryFn?.({} as never)).rejects.toThrow();
			expect(read).not.toHaveBeenCalled();
			expect(mocks.access).not.toHaveBeenCalled();
		} finally {
			log.mockRestore();
		}
	},
);
