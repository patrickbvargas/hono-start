// @vitest-environment jsdom

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDashboardDetailsPreference } from "../hooks/use-details-preference";

describe("dashboard details preference", () => {
	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
		localStorage.clear();
	});

	it("defaults to hidden and restores the saved choice after remount", () => {
		const first = renderHook(useDashboardDetailsPreference);
		expect(first.result.current.showDetails).toBe(false);
		act(() => first.result.current.handleShowDetailsChange(true));
		expect(localStorage.getItem("dashboard.showDetailedAnalyses")).toBe("true");
		first.unmount();
		const second = renderHook(useDashboardDetailsPreference);
		expect(second.result.current.showDetails).toBe(true);
		act(() => second.result.current.handleShowDetailsChange(false));
		expect(localStorage.getItem("dashboard.showDetailedAnalyses")).toBe(
			"false",
		);
	});

	it("allows toggling when browser storage is unavailable", () => {
		vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
			throw new Error("Storage unavailable");
		});
		vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
			throw new Error("Storage unavailable");
		});
		const { result } = renderHook(useDashboardDetailsPreference);
		act(() => result.current.handleShowDetailsChange(true));
		expect(result.current.showDetails).toBe(true);
	});
});
