import { useCallback, useMemo, useReducer, useRef } from "react";
import type { OverlayState } from "@/shared/types/overlay";

// "create" carries no data — it always opens a blank form
type VoidKey = "create";
// All other keys require an entity to operate on
type DataKey = "edit" | "delete" | "details" | "restore";
type OverlayKey = VoidKey | DataKey;

// Internal discriminated union — enforces only one overlay active at a time.
// VoidKey has no `selected` field; all DataKeys always have one.
type InternalState<T> =
	| { key: VoidKey }
	| { key: DataKey; selected: T }
	| { key: null };

type OverlayAction<T> =
	| { type: "close" }
	| { type: "open-create" }
	| { type: "open-data"; key: DataKey; selected: T };

function overlayReducer<T>(
	_state: InternalState<T>,
	action: OverlayAction<T>,
): InternalState<T> {
	switch (action.type) {
		case "close":
			return { key: null };
		case "open-create":
			return { key: "create" };
		case "open-data":
			return { key: action.key, selected: action.selected };
	}
}

function isDataState<T>(
	state: InternalState<T>,
	key: DataKey,
): state is { key: DataKey; selected: T } {
	return state.key === key;
}

export function useOverlay<T>() {
	const [state, dispatch] = useReducer(
		(current: InternalState<T>, action: OverlayAction<T>) =>
			overlayReducer(current, action),
		{ key: null } as InternalState<T>,
	);
	const activeKeyRef = useRef<InternalState<T>["key"]>(state.key);
	activeKeyRef.current = state.key;

	const close = useCallback(() => dispatch({ type: "close" }), []);

	const overlay = useMemo(() => {
		const makeState = (key: OverlayKey): OverlayState => ({
			isOpen: state.key === key,
			onOpenChange: (isOpen: boolean) => {
				if (!isOpen && activeKeyRef.current === key) {
					close();
				}
			},
			close,
		});

		/**
		 * Scope for overlays that carry no data.
		 * - `open()` takes no arguments.
		 * - `render(fn)` callback receives only `ctx`.
		 */
		const createVoidScope = (key: VoidKey) => ({
			isOpen: state.key === key,
			open: () => dispatch({ type: "open-create" }),
			close,
			render: <R>(fn: (state: OverlayState) => R): R | null => {
				if (state.key !== key) {
					return null;
				}

				return fn(makeState(key));
			},
		});

		/**
		 * Scope for overlays that require an entity.
		 * - `open(data)` is required — TypeScript will enforce data is provided.
		 * - `render(fn)` callback receives `(data: T, ctx)`.
		 */
		const createDataScope = <K extends DataKey>(key: K) => ({
			isOpen: state.key === key,
			open: (data: T) => dispatch({ type: "open-data", key, selected: data }),
			close,
			render: <R>(fn: (data: T, state: OverlayState) => R): R | null => {
				if (!isDataState(state, key)) {
					return null;
				}

				return fn(state.selected, makeState(key));
			},
		});

		return {
			create: createVoidScope("create"),
			edit: createDataScope("edit"),
			details: createDataScope("details"),
			delete: createDataScope("delete"),
			restore: createDataScope("restore"),
		};
	}, [state, close]);

	return {
		/** The key of the currently active overlay, or null if none. */
		activeKey: state.key,
		close,
		overlay,
	};
}
