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
vi.mock("../clients/hooks/use-data", () => ({
	useClient: () => ({ client: state.record }),
}));
vi.mock("../employees/hooks/use-data", () => ({
	useEmployee: () => ({ employee: state.record }),
}));
vi.mock("../expenses/hooks/use-data", () => ({
	useExpense: () => ({ expense: state.record }),
}));
vi.mock("../fees/hooks/use-data", () => ({
	useFee: () => ({ fee: state.record }),
}));
vi.mock("../remunerations/hooks/use-data", () => ({
	useRemuneration: () => ({ remuneration: state.record }),
}));

import { useClientWorkspace } from "../clients/hooks/use-workspace";
import { useEmployeeWorkspace } from "../employees/hooks/use-workspace";
import { useExpenseWorkspace } from "../expenses/hooks/use-workspace";
import { useFeeWorkspace } from "../fees/hooks/use-workspace";
import { useRemunerationWorkspace } from "../remunerations/hooks/use-workspace";

const workspaces = [
	{ feature: "clients", hook: useClientWorkspace },
	{ feature: "employees", hook: useEmployeeWorkspace },
	{ feature: "expenses", hook: useExpenseWorkspace },
	{ feature: "fees", hook: useFeeWorkspace },
	{ feature: "remunerations", hook: useRemunerationWorkspace },
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
	it.each(["COMPLETED", "CANCELLED"])(
		"keeps fees on %s contracts read-only for edits",
		(status) => {
			state.permissions = ["org:fees:update", "org:fees:delete"];
			state.record.contractStatusValue = status;
			const { result } = renderHook(() => useFeeWorkspace(42));
			expect(result.current.canEdit).toBe(false);
		},
	);
});
