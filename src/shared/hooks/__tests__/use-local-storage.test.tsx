// @vitest-environment jsdom

import { act, cleanup, renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as z from "zod";
import { useLocalStorage } from "../use-local-storage";

const booleanSchema = z.boolean();

function Example() {
	const [hidden] = useLocalStorage("preference", true, {
		schema: booleanSchema,
		defaultValue: false,
	});
	return <span>{String(hidden)}</span>;
}

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	localStorage.clear();
});

describe("useLocalStorage", () => {
	it("restores storage without overwriting it during mount", () => {
		localStorage.setItem("preference", "true");
		const write = vi.spyOn(Storage.prototype, "setItem");
		const { result } = renderHook(() =>
			useLocalStorage("preference", false, { schema: booleanSchema }),
		);
		expect(result.current[0]).toBe(true);
		expect(write).not.toHaveBeenCalled();
	});

	it("uses the initial value during server rendering and a separate missing-value default", () => {
		expect(renderToString(<Example />)).toBe("<span>true</span>");
		const { result } = renderHook(() =>
			useLocalStorage("preference", true, {
				schema: booleanSchema,
				defaultValue: false,
			}),
		);
		expect(result.current[0]).toBe(false);
		expect(localStorage.getItem("preference")).toBeNull();
	});

	it.each(["{invalid", '"wrong type"', "null"])(
		"handles invalid storage: %s",
		(stored) => {
			localStorage.setItem("preference", stored);
			const { result } = renderHook(() =>
				useLocalStorage("preference", false, { schema: booleanSchema }),
			);
			expect(result.current[0]).toBe(false);
		},
	);

	it("applies consecutive functional updates and persists the result", () => {
		const { result } = renderHook(() =>
			useLocalStorage("preference", false, { schema: booleanSchema }),
		);
		act(() => {
			result.current[1]((value) => !value);
			result.current[1]((value) => !value);
		});
		expect(result.current[0]).toBe(false);
		expect(localStorage.getItem("preference")).toBe("false");
	});

	it("retains private initial state and works in memory when storage throws", () => {
		vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
			throw new Error("Unavailable");
		});
		vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
			throw new Error("Unavailable");
		});
		const { result } = renderHook(() =>
			useLocalStorage("preference", true, {
				schema: booleanSchema,
				defaultValue: false,
			}),
		);
		expect(result.current[0]).toBe(true);
		act(() => result.current[1]((value) => !value));
		expect(result.current[0]).toBe(false);
	});

	it("reads a new key without copying the previous key's value into storage", () => {
		localStorage.setItem("second", "true");
		const { result, rerender } = renderHook(
			({ storageKey }) =>
				useLocalStorage(storageKey, false, { schema: booleanSchema }),
			{ initialProps: { storageKey: "first" } },
		);
		rerender({ storageKey: "second" });
		expect(result.current[0]).toBe(true);
		expect(localStorage.getItem("first")).toBeNull();
	});
});
