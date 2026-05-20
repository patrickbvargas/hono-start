// @vitest-environment jsdom

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useEmployeeFilter } from "../hooks/use-filter";

const cancelMock = vi.fn();
const handleFilterMock = vi.fn();
const handleResetFilterMock = vi.fn();
const hasNonDefaultFilterMock = vi.fn();
const resetMock = vi.fn();
const useAppFormMock = vi.fn();
const debounceFactoryMock = vi.fn();

vi.mock("use-debounce", () => ({
	useDebouncedCallback: (...args: unknown[]) => debounceFactoryMock(...args),
}));

vi.mock("@/shared/hooks/use-app-form", () => ({
	useAppForm: (...args: unknown[]) => useAppFormMock(...args),
}));

vi.mock("@/shared/hooks/use-filter", () => ({
	useFilter: () => ({
		filter: {
			query: "maria",
			type: ["LAWYER"],
			role: ["ADMIN"],
			active: "false",
			status: "all",
		},
		defaultFilter: {
			query: "",
			type: [],
			role: [],
			active: "all",
			status: "active",
		},
		handleFilter: handleFilterMock,
		handleResetFilter: handleResetFilterMock,
		hasNonDefaultFilter: hasNonDefaultFilterMock,
	}),
}));

describe("useEmployeeFilter", () => {
	it("applies explicit filter payloads through shared search orchestration", () => {
		cancelMock.mockReset();
		handleResetFilterMock.mockReset();
		resetMock.mockReset();
		handleFilterMock.mockReset();
		hasNonDefaultFilterMock.mockReset();
		useAppFormMock.mockReset();
		debounceFactoryMock.mockReset();

		hasNonDefaultFilterMock.mockReturnValue(true);
		debounceFactoryMock.mockReturnValue({
			cancel: cancelMock,
			flush: vi.fn(),
		});
		useAppFormMock.mockReturnValue({
			reset: resetMock,
		});

		const { result } = renderHook(() => useEmployeeFilter());

		result.current.handleApplyFilter({
			query: "",
			type: [],
			role: [],
			active: "all",
			status: "active",
		});

		expect(cancelMock).toHaveBeenCalledTimes(1);
		expect(resetMock).toHaveBeenCalledWith({
			query: "",
			type: [],
			role: [],
			active: "all",
			status: "active",
		});
		expect(handleFilterMock).toHaveBeenCalledWith({
			query: "",
			type: [],
			role: [],
			active: "all",
			status: "active",
		});
	});

	it("exposes clear behavior using shared default filters", () => {
		cancelMock.mockReset();
		handleResetFilterMock.mockReset();
		resetMock.mockReset();
		handleFilterMock.mockReset();
		hasNonDefaultFilterMock.mockReset();
		useAppFormMock.mockReset();
		debounceFactoryMock.mockReset();

		hasNonDefaultFilterMock.mockImplementation(
			(keys?: string[]) => !Array.isArray(keys),
		);
		debounceFactoryMock.mockReturnValue({
			cancel: cancelMock,
			flush: vi.fn(),
		});
		useAppFormMock.mockReturnValue({
			reset: resetMock,
		});

		const { result } = renderHook(() => useEmployeeFilter());

		expect(result.current.canClearFilters).toBe(true);

		result.current.handleClearFilters();

		expect(cancelMock).toHaveBeenCalledTimes(1);
		expect(resetMock).toHaveBeenCalledWith({
			query: "",
			type: [],
			role: [],
			active: "all",
			status: "active",
		});
		expect(handleResetFilterMock).toHaveBeenCalledTimes(1);
	});
});
