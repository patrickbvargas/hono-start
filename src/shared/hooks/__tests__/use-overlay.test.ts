import { beforeEach, describe, expect, it, vi } from "vitest";
import type { OverlayState } from "@/shared/types/overlay";

const hookRuntime = vi.hoisted(() => {
	let reducerState: unknown;

	return {
		beginRender: () => {},
		reset: () => {
			reducerState = undefined;
		},
		module: {
			useCallback: <T extends (...args: never[]) => unknown>(callback: T) =>
				callback,
			useMemo: <T>(factory: () => T) => factory(),
			useReducer: <S, A>(
				reducer: (state: S, action: A) => S,
				initialState: S,
			): [S, (action: A) => void] => {
				if (reducerState === undefined) {
					reducerState = initialState;
				}

				return [
					reducerState as S,
					(action: A) => {
						reducerState = reducer(reducerState as S, action);
					},
				];
			},
		},
	};
});

vi.mock("react", () => hookRuntime.module);

import { useOverlay } from "../use-overlay";

function renderOverlay<T>() {
	hookRuntime.beginRender();
	return useOverlay<T>();
}

describe("useOverlay", () => {
	beforeEach(() => {
		hookRuntime.reset();
	});

	it("starts closed with named overlay scopes", () => {
		const current = renderOverlay<number>();

		expect(current.openKeys).toEqual([]);
		expect(current.overlay.create.isOpen).toBe(false);
		expect(current.overlay.edit.isOpen).toBe(false);
		expect(current.overlay.details.isOpen).toBe(false);
		expect(current.overlay.delete.isOpen).toBe(false);
		expect(current.overlay.restore.isOpen).toBe(false);
	});

	it("opens and renders create without selected entity data", () => {
		let current = renderOverlay<number>();
		const renderCreate = vi.fn((state: OverlayState) => state.isOpen);

		expect(current.overlay.create.render(renderCreate)).toBeNull();
		expect(renderCreate).not.toHaveBeenCalled();

		current.overlay.create.open();
		current = renderOverlay<number>();

		expect(current.openKeys).toEqual(["create"]);
		expect(current.overlay.create.isOpen).toBe(true);
		expect(current.overlay.create.render(renderCreate)).toBe(true);
		expect(renderCreate).toHaveBeenCalledWith(
			expect.objectContaining({
				isOpen: true,
				close: expect.any(Function),
				onOpenChange: expect.any(Function),
			}),
		);

		current.overlay.create.close();
		current = renderOverlay<number>();

		expect(current.openKeys).toEqual([]);
		expect(current.overlay.create.render(renderCreate)).toBeNull();
	});

	it("opens and renders data overlays with selected entity data", () => {
		let current = renderOverlay<number>();
		const renderEdit = vi.fn((id: number) => id);

		current.overlay.edit.open(123);
		current = renderOverlay<number>();

		expect(current.openKeys).toEqual(["edit"]);
		expect(current.overlay.edit.isOpen).toBe(true);
		expect(current.overlay.edit.render(renderEdit)).toBe(123);
		expect(renderEdit).toHaveBeenCalledWith(
			123,
			expect.objectContaining({
				isOpen: true,
				close: expect.any(Function),
				onOpenChange: expect.any(Function),
			}),
		);
	});

	it("keeps multiple overlays open in the same hook instance", () => {
		let current = renderOverlay<number>();
		const renderDetails = vi.fn((id: number) => `details-${id}`);
		const renderDelete = vi.fn((id: number) => `delete-${id}`);

		current.overlay.details.open(123);
		current.overlay.delete.open(456);
		current = renderOverlay<number>();

		expect(current.openKeys).toEqual(["details", "delete"]);
		expect(current.overlay.details.isOpen).toBe(true);
		expect(current.overlay.delete.isOpen).toBe(true);
		expect(current.overlay.details.render(renderDetails)).toBe("details-123");
		expect(current.overlay.delete.render(renderDelete)).toBe("delete-456");
	});

	it("closes only the overlay that receives onOpenChange(false)", () => {
		let current = renderOverlay<number>();
		const capturedStates: OverlayState[] = [];

		current.overlay.edit.open(123);
		current.overlay.delete.open(456);
		current = renderOverlay<number>();

		current.overlay.edit.render((_id, state) => {
			capturedStates.push(state);
			return null;
		});
		current.overlay.delete.render((_id, state) => {
			capturedStates.push(state);
			return null;
		});

		capturedStates[0]?.onOpenChange(false);
		current = renderOverlay<number>();

		expect(current.openKeys).toEqual(["delete"]);
		expect(current.overlay.edit.isOpen).toBe(false);
		expect(current.overlay.delete.isOpen).toBe(true);

		capturedStates[1]?.onOpenChange(false);
		current = renderOverlay<number>();

		expect(current.openKeys).toEqual([]);
		expect(current.overlay.delete.isOpen).toBe(false);
	});

	it("ignores close signals for already closed overlays", () => {
		let current = renderOverlay<number>();
		const capturedStates: OverlayState[] = [];

		current.overlay.details.open(123);
		current = renderOverlay<number>();
		current.overlay.details.render((_id, state) => {
			capturedStates.push(state);
			return null;
		});

		capturedStates[0]?.onOpenChange(false);
		current = renderOverlay<number>();
		capturedStates[0]?.onOpenChange(false);
		current = renderOverlay<number>();

		expect(current.openKeys).toEqual([]);
		expect(current.overlay.details.isOpen).toBe(false);
	});
});
