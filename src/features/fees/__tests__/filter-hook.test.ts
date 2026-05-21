// @vitest-environment jsdom

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useFeeFilter } from "../hooks/use-filter";

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
			query: "123",
			contractId: "12",
			revenueId: "15",
			dateFrom: "2026-01-01",
			dateTo: "2026-01-31",
			active: "false",
			status: "all",
		},
		defaultFilter: {
			query: "",
			contractId: "",
			revenueId: "",
			dateFrom: "",
			dateTo: "",
			active: "all",
			status: "active",
		},
		handleFilter: handleFilterMock,
		handleResetFilter: handleResetFilterMock,
		hasNonDefaultFilter: hasNonDefaultFilterMock,
	}),
}));

describe("useFeeFilter", () => {
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

		const { result } = renderHook(() => useFeeFilter());

		result.current.handleApplyFilter({
			query: "",
			contractId: "",
			revenueId: "",
			dateFrom: "",
			dateTo: "",
			active: "all",
			status: "active",
		});

		expect(cancelMock).toHaveBeenCalledTimes(1);
		expect(resetMock).toHaveBeenCalledWith({
			query: "",
			contractId: "",
			revenueId: "",
			dateFrom: "",
			dateTo: "",
			active: "all",
			status: "active",
		});
		expect(handleFilterMock).toHaveBeenCalledWith({
			query: "",
			contractId: "",
			revenueId: "",
			dateFrom: "",
			dateTo: "",
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

		const { result } = renderHook(() => useFeeFilter());

		expect(result.current.canClearFilters).toBe(true);

		result.current.handleClearFilters();

		expect(cancelMock).toHaveBeenCalledTimes(1);
		expect(resetMock).toHaveBeenCalledWith({
			query: "",
			contractId: "",
			revenueId: "",
			dateFrom: "",
			dateTo: "",
			active: "all",
			status: "active",
		});
		expect(handleResetFilterMock).toHaveBeenCalledTimes(1);
	});
});
