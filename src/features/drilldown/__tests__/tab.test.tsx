// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useDrilldownTab } from "../hooks/use-tab";

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	localStorage.clear();
});

it("defaults to summary and restores the selected tab across drilldowns", () => {
	const first = renderHook(useDrilldownTab);
	expect(first.result.current.tab).toBe("summary");
	act(() => first.result.current.handleTabChange("data"));
	expect(localStorage.getItem("drilldown.tab")).toBe('"data"');
	first.unmount();
	const second = renderHook(useDrilldownTab);
	expect(second.result.current.tab).toBe("data");
	act(() => second.result.current.handleTabChange("invalid"));
	expect(second.result.current.tab).toBe("data");
});

it.each(['"invalid"', "{", "null"])(
	"falls back for invalid preference %s",
	(stored) => {
		localStorage.setItem("drilldown.tab", stored);
		expect(renderHook(useDrilldownTab).result.current.tab).toBe("summary");
	},
);

it("keeps switching usable when storage throws", () => {
	vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
		throw new Error("Unavailable");
	});
	vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
		throw new Error("Unavailable");
	});
	const { result } = renderHook(useDrilldownTab);
	expect(result.current.tab).toBe("summary");
	act(() => result.current.handleTabChange("data"));
	expect(result.current.tab).toBe("data");
});
