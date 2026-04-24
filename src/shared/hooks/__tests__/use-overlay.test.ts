import { beforeEach, describe, expect, it, vi } from "vitest";
import type { OverlayState } from "@/shared/types/overlay";

const hookRuntime = vi.hoisted(() => {
	let reducerState: unknown;
	let refs: Array<{ current: unknown }> = [];
	let refIndex = 0;

	return {
		beginRender: () => {
			refIndex = 0;
		},
		reset: () => {
			reducerState = undefined;
			refs = [];
			refIndex = 0;
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
			useRef: <T>(initialValue: T): { current: T } => {
				const currentIndex = refIndex;
				refIndex += 1;

				if (!refs[currentIndex]) {
					refs[currentIndex] = { current: initialValue };
				}

				return refs[currentIndex] as { current: T };
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

		expect(current.activeKey).toBeNull();
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

		expect(current.activeKey).toBe("create");
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

		expect(current.activeKey).toBeNull();
		expect(current.overlay.create.render(renderCreate)).toBeNull();
	});

	it("opens and renders data overlays with selected entity data", () => {
		let current = renderOverlay<number>();
		const renderEdit = vi.fn((id: number) => id);

		current.overlay.edit.open(123);
		current = renderOverlay<number>();

		expect(current.activeKey).toBe("edit");
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

	it("keeps only one active overlay in the same hook instance", () => {
		let current = renderOverlay<number>();
		const renderCreate = vi.fn(() => "create");
		const renderDelete = vi.fn((id: number) => `delete-${id}`);

		current.overlay.create.open();
		current = renderOverlay<number>();

		expect(current.overlay.create.render(renderCreate)).toBe("create");

		current.overlay.delete.open(456);
		current = renderOverlay<number>();

		expect(current.activeKey).toBe("delete");
		expect(current.overlay.create.isOpen).toBe(false);
		expect(current.overlay.delete.isOpen).toBe(true);
		expect(current.overlay.create.render(renderCreate)).toBeNull();
		expect(current.overlay.delete.render(renderDelete)).toBe("delete-456");
	});

	it("closes only when onOpenChange(false) belongs to the active overlay", () => {
		let current = renderOverlay<number>();
		const capturedStates: OverlayState[] = [];

		current.overlay.edit.open(123);
		current = renderOverlay<number>();
		current.overlay.edit.render((_id, state) => {
			capturedStates.push(state);
			return null;
		});

		current.overlay.delete.open(456);
		current = renderOverlay<number>();
		capturedStates[0]?.onOpenChange(false);
		current = renderOverlay<number>();

		expect(current.activeKey).toBe("delete");

		current.overlay.delete.render((_id, state) => {
			state.onOpenChange(false);
			return null;
		});
		current = renderOverlay<number>();

		expect(current.activeKey).toBeNull();
		expect(current.overlay.edit.isOpen).toBe(false);
	});
});
