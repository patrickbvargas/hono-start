// @vitest-environment jsdom

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAuditLogFilter } from "../hooks/use-filter";

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
			query: "joao",
			action: ["CREATE"],
			entityType: ["contract"],
			actorName: ["Joao Silva"],
		},
		defaultFilter: {
			query: "",
			action: [],
			entityType: [],
			actorName: [],
		},
		handleFilter: handleFilterMock,
		handleResetFilter: handleResetFilterMock,
		canClearFilters: hasNonDefaultFilterMock,
		hasNonDefaultFilter: hasNonDefaultFilterMock,
	}),
}));

describe("useAuditLogFilter", () => {
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

		const { result } = renderHook(() => useAuditLogFilter());

		result.current.handleApplyFilter({
			query: "",
			action: [],
			entityType: [],
			actorName: [],
		});

		expect(cancelMock).toHaveBeenCalledTimes(1);
		expect(resetMock).toHaveBeenCalledWith({
			query: "",
			action: [],
			entityType: [],
			actorName: [],
		});
		expect(handleFilterMock).toHaveBeenCalledWith({
			query: "",
			action: [],
			entityType: [],
			actorName: [],
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

		const { result } = renderHook(() => useAuditLogFilter());

		expect(result.current.canClearFilters).toBe(true);

		result.current.handleClearFilters();

		expect(cancelMock).toHaveBeenCalledTimes(1);
		expect(resetMock).toHaveBeenCalledWith({
			query: "",
			action: [],
			entityType: [],
			actorName: [],
		});
		expect(handleResetFilterMock).toHaveBeenCalledTimes(1);
	});
});
