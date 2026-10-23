// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useDrilldownController } from "../hooks/use-controller";

afterEach(() => {
	vi.unstubAllGlobals();
	document.body.replaceChildren();
});

it("restores the current trigger after the controlled modal is removed", () => {
	let frame: FrameRequestCallback = () => {};
	vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
		frame = callback;
		return 1;
	});
	const original = document.createElement("button");
	document.body.append(original);
	let trigger = original;
	const close = vi.fn();
	const { result } = renderHook(() =>
		useDrilldownController({
			state: { isOpen: true, onOpenChange: close, close: vi.fn() },
			returnFocus: () => trigger,
		}),
	);
	result.current.handleOpenChange(false);
	expect(close).toHaveBeenCalledWith(false);
	original.remove();
	trigger = document.createElement("button");
	document.body.append(trigger);
	frame(0);
	expect(document.activeElement).toBe(trigger);
});
