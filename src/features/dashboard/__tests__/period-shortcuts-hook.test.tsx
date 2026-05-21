// @vitest-environment jsdom

import { renderHook } from "@testing-library/react";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDashboardFilter } from "../hooks/use-filter";
import { getDashboardPeriodShortcutById } from "../utils/period-shortcuts";

const { useAppFormMock, useFilterMock } = vi.hoisted(() => ({
	useAppFormMock: vi.fn(),
	useFilterMock: vi.fn(),
}));

vi.mock("@/shared/hooks/use-app-form", () => ({
	useAppForm: useAppFormMock,
}));

vi.mock("@/shared/hooks/use-filter", () => ({
	useFilter: useFilterMock,
}));

describe("useDashboardFilter", () => {
	beforeEach(() => {
		const handleFilter = vi.fn();
		const handleResetFilter = vi.fn();

		useFilterMock.mockReturnValue({
			filter: {
				dateFrom: "2026-01-01",
				dateTo: "2026-05-06",
				employeeId: "",
				legalArea: [],
				revenueType: [],
			},
			defaultFilter: {
				dateFrom: "2026-01-01",
				dateTo: "2026-05-06",
				employeeId: "",
				legalArea: [],
				revenueType: [],
			},
			handleFilter,
			handleResetFilter,
			hasNonDefaultFilter: vi.fn(() => false),
		});

		useAppFormMock.mockReturnValue({
			handleSubmit: vi.fn(),
			reset: vi.fn(),
			setFieldValue: vi.fn(),
		});
	});

	it("applies shortcut dates through the existing form submit flow", () => {
		const form = {
			handleSubmit: vi.fn(),
			setFieldValue: vi.fn(),
		};

		useAppFormMock.mockReturnValue(form);

		const { result } = renderHook(() => useDashboardFilter());

		act(() => {
			result.current.handlePeriodShortcut(
				"last6Months",
				new Date("2026-05-05T12:00:00.000Z"),
			);
		});

		expect(form.setFieldValue).toHaveBeenNthCalledWith(
			1,
			"dateFrom",
			"2025-12-05",
			{
				dontRunListeners: true,
				dontValidate: true,
			},
		);
		expect(form.setFieldValue).toHaveBeenNthCalledWith(
			2,
			"dateTo",
			"2026-05-05",
			{
				dontRunListeners: true,
				dontValidate: true,
			},
		);
		expect(form.handleSubmit).toHaveBeenCalledTimes(1);
	});

	it("preserves inline shortcut period when clearing advanced filters", () => {
		const shortcut = getDashboardPeriodShortcutById("last6Months");
		const handleFilter = vi.fn();
		const form = {
			handleSubmit: vi.fn(),
			reset: vi.fn(),
			setFieldValue: vi.fn(),
		};

		useFilterMock.mockReturnValue({
			filter: {
				dateFrom: shortcut.dateFrom,
				dateTo: shortcut.dateTo,
				employeeId: "",
				legalArea: ["CIVIL"],
				revenueType: [],
			},
			defaultFilter: {
				dateFrom: "2026-01-01",
				dateTo: "2026-05-06",
				employeeId: "",
				legalArea: [],
				revenueType: [],
			},
			handleFilter,
			handleResetFilter: vi.fn(),
			hasNonDefaultFilter: vi.fn(() => true),
		});
		useAppFormMock.mockReturnValue(form);

		const { result } = renderHook(() => useDashboardFilter());

		act(() => {
			result.current.handleClearAdvancedFilters();
		});

		expect(form.reset).toHaveBeenCalledWith({
			dateFrom: shortcut.dateFrom,
			dateTo: shortcut.dateTo,
			employeeId: "",
			legalArea: [],
			revenueType: [],
		});
		expect(handleFilter).toHaveBeenCalledWith({
			dateFrom: shortcut.dateFrom,
			dateTo: shortcut.dateTo,
			employeeId: "",
			legalArea: [],
			revenueType: [],
		});
	});

	it("resets manual period with other advanced filters when clearing", () => {
		const handleFilter = vi.fn();
		const form = {
			handleSubmit: vi.fn(),
			reset: vi.fn(),
			setFieldValue: vi.fn(),
		};

		useFilterMock.mockReturnValue({
			filter: {
				dateFrom: "2026-02-01",
				dateTo: "2026-04-30",
				employeeId: "",
				legalArea: ["CIVIL"],
				revenueType: ["JUDICIAL"],
			},
			defaultFilter: {
				dateFrom: "2026-01-01",
				dateTo: "2026-05-06",
				employeeId: "",
				legalArea: [],
				revenueType: [],
			},
			handleFilter,
			handleResetFilter: vi.fn(),
			hasNonDefaultFilter: vi.fn(() => true),
		});
		useAppFormMock.mockReturnValue(form);

		const { result } = renderHook(() => useDashboardFilter());

		act(() => {
			result.current.handleClearAdvancedFilters();
		});

		expect(form.reset).toHaveBeenCalledWith({
			dateFrom: "2026-01-01",
			dateTo: "2026-05-06",
			employeeId: "",
			legalArea: [],
			revenueType: [],
		});
		expect(handleFilter).toHaveBeenCalledWith({
			dateFrom: "2026-01-01",
			dateTo: "2026-05-06",
			employeeId: "",
			legalArea: [],
			revenueType: [],
		});
	});
});
