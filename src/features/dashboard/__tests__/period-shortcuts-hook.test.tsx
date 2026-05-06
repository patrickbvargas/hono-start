// @vitest-environment jsdom

import { renderHook } from "@testing-library/react";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDashboardFilter } from "../hooks/use-filter";

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
		useFilterMock.mockReturnValue({
			filter: {
				dateFrom: "2026-01-01",
				dateTo: "2026-05-06",
				employeeId: "",
				legalArea: "",
				revenueType: "",
			},
			handleFilter: vi.fn(),
		});

		useAppFormMock.mockReturnValue({
			handleSubmit: vi.fn(),
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
});
