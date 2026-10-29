// @vitest-environment jsdom

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCopyToClipboard } from "../use-copy-to-clipboard";

const writeText = vi.fn();

beforeEach(() => {
	vi.useFakeTimers();
	vi.stubGlobal("navigator", { clipboard: { writeText } });
	writeText.mockResolvedValue(undefined);
});

afterEach(() => {
	cleanup();
	vi.useRealTimers();
	vi.unstubAllGlobals();
	vi.resetAllMocks();
});

describe("useCopyToClipboard", () => {
	it("confirms only successful writes and resets feedback after two seconds", async () => {
		const { result } = renderHook(() => useCopyToClipboard("0001234-56"));
		await act(() => result.current.copy());
		expect(writeText).toHaveBeenCalledWith("0001234-56");
		expect(result.current.status).toBe("copied");
		act(() => vi.advanceTimersByTime(2000));
		expect(result.current.status).toBe("idle");
	});

	it("handles denied or unavailable clipboard without reporting success", async () => {
		writeText.mockRejectedValueOnce(new Error("Denied"));
		const { result } = renderHook(() => useCopyToClipboard("123"));
		await act(() => result.current.copy());
		expect(result.current.status).toBe("error");
		vi.stubGlobal("navigator", {});
		await act(() => result.current.copy());
		expect(result.current.status).toBe("error");
	});

	it("ignores empty values", async () => {
		const { result } = renderHook(() => useCopyToClipboard(" "));
		await act(() => result.current.copy());
		expect(writeText).not.toHaveBeenCalled();
	});

	it("ignores stale completion after changing records", async () => {
		let resolve!: () => void;
		writeText.mockImplementationOnce(
			() =>
				new Promise<void>((done) => {
					resolve = done;
				}),
		);
		const { result, rerender } = renderHook(
			({ value }) => useCopyToClipboard(value),
			{ initialProps: { value: "old" } },
		);
		let operation!: Promise<void>;
		act(() => {
			operation = result.current.copy();
		});
		rerender({ value: "new" });
		await act(async () => {
			resolve();
			await operation;
		});
		expect(result.current.status).toBe("idle");
	});

	it("clears feedback timers when unmounted", async () => {
		const { result, unmount } = renderHook(() => useCopyToClipboard("123"));
		await act(() => result.current.copy());
		unmount();
		expect(vi.getTimerCount()).toBe(0);
	});
});
