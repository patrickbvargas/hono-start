// @vitest-environment jsdom

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useExpenseFilter } from "../hooks/use-filter";

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
			query: "fixa",
			category: "PHONE",
			dateFrom: "2026-06-01",
			dateTo: "2026-06-30",
			active: "false",
			status: "all",
		},
		defaultFilter: {
			query: "",
			category: "",
			dateFrom: "",
			dateTo: "",
			active: "all",
			status: "active",
		},
		handleFilter: handleFilterMock,
		handleResetFilter: handleResetFilterMock,
		hasNonDefaultFilter: hasNonDefaultFilterMock,
		canClearFilters: hasNonDefaultFilterMock,
	}),
}));

describe("useExpenseFilter", () => {
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
		useAppFormMock.mockReturnValue({ reset: resetMock });

		const { result } = renderHook(() => useExpenseFilter());

		result.current.handleApplyFilter({
			query: "",
			category: "",
			dateFrom: "",
			dateTo: "",
			active: "all",
			status: "active",
		});

		expect(cancelMock).toHaveBeenCalledTimes(1);
		expect(resetMock).toHaveBeenCalledWith({
			query: "",
			category: "",
			dateFrom: "",
			dateTo: "",
			active: "all",
			status: "active",
		});
		expect(handleFilterMock).toHaveBeenCalledWith({
			query: "",
			category: "",
			dateFrom: "",
			dateTo: "",
			active: "all",
			status: "active",
		});
	});
});
