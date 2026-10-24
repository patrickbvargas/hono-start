// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const location = vi.hoisted(() => ({ key: undefined as string | undefined }));
vi.mock("@tanstack/react-router", () => ({ useLocation: () => location.key }));

import { useFilterPanel } from "../use-filter-panel";

afterEach(cleanup);
describe("filter panel navigation", () => {
	it("collapses each collection arrival on a reused route and preserves manual opening otherwise", () => {
		location.key = undefined;
		const { result, rerender } = renderHook(() => useFilterPanel());
		expect(result.current[0]).toBe(false);
		act(() => result.current[1](true));
		rerender();
		expect(result.current[0]).toBe(true);
		location.key = "collection-1";
		rerender();
		expect(result.current[0]).toBe(false);
		act(() => result.current[1](true));
		rerender();
		expect(result.current[0]).toBe(true);
		location.key = undefined;
		rerender();
		expect(result.current[0]).toBe(true);
		location.key = "collection-2";
		rerender();
		expect(result.current[0]).toBe(false);
	});
});
