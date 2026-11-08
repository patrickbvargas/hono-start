// @vitest-environment jsdom
import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
	permissions: [] as string[],
	record: { isSoftDeleted: false, contractStatusValue: "ACTIVE" },
}));
vi.mock("@/shared/session", () => ({
	useLoggedUserSession: () => ({ permissions: state.permissions }),
	hasPermission: (session: { permissions: string[] }, key: string) =>
		session.permissions.includes(key),
	CONTRACT_STATUS_CANCELLED_VALUE: "CANCELLED",
	CONTRACT_STATUS_COMPLETED_VALUE: "COMPLETED",
}));
vi.mock("../people/hooks/use-data", () => ({
	usePerson: () => ({ person: state.record }),
}));
vi.mock("../expenses/hooks/use-data", () => ({
	useExpense: () => ({ expense: state.record }),
}));

import { useExpenseWorkspace } from "../expenses/hooks/use-workspace";

import { usePersonWorkspace } from "../people/hooks/use-workspace";

const workspaces = [
	{ feature: "people", hook: usePersonWorkspace },
	{ feature: "expenses", hook: useExpenseWorkspace },
];
beforeEach(() => {
	state.permissions = [];
	state.record.isSoftDeleted = false;
	state.record.contractStatusValue = "ACTIVE";
});
afterEach(cleanup);
describe("workspace action authorization", () => {
	it.each(workspaces)(
		"hides writes without explicit $feature grants",
		({ hook }) => {
			const { result } = renderHook(() => hook(42));
			expect(result.current).toMatchObject({
				canEdit: false,
				canDelete: false,
				canRestore: false,
			});
		},
	);
	it.each(workspaces)(
		"uses independent lifecycle grants for $feature",
		({ feature, hook }) => {
			state.permissions = [`org:${feature}:update`, `org:${feature}:delete`];
			const { result, rerender } = renderHook(() => hook(42));
			expect(result.current).toMatchObject({
				canEdit: true,
				canDelete: true,
				canRestore: false,
			});
			state.record.isSoftDeleted = true;
			rerender();
			expect(result.current).toMatchObject({
				canEdit: false,
				canDelete: false,
				canRestore: false,
			});
			state.permissions = [`org:${feature}:restore`];
			rerender();
			expect(result.current).toMatchObject({
				canEdit: false,
				canDelete: false,
				canRestore: true,
			});
		},
	);
});
