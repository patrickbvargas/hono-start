// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	filter: {
		query: "",
		severity: ["low"],
		type: [],
		clientId: "",
		employeeId: "",
	},
	handleFilter: vi.fn(),
}));
vi.mock("@/shared/hooks/use-filter", () => ({
	useFilter: () => ({
		filter: mocks.filter,
		defaultFilter: {
			query: "",
			severity: [],
			type: [],
			clientId: "",
			employeeId: "",
		},
		handleFilter: mocks.handleFilter,
		handleResetFilter: vi.fn(),
		canClearFilters: () => true,
	}),
}));
vi.mock("use-debounce", () => ({
	useDebouncedCallback: () =>
		Object.assign(vi.fn(), { cancel: vi.fn(), flush: vi.fn() }),
}));

import { usePendingWorkFilter } from "../hooks/use-filter";

it("synchronizes a touched checkbox form after external card navigation", () => {
	const { result, rerender } = renderHook(() => usePendingWorkFilter());
	act(() => result.current.form.setFieldValue("severity", ["medium"]));
	expect(result.current.form.state.values.severity).toEqual(["medium"]);
	mocks.filter = { ...mocks.filter, severity: ["high"] };
	rerender();
	expect(result.current.form.state.values.severity).toEqual(["high"]);
});
