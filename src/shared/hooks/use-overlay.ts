import * as React from "react";
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

export function useOverlay<T>() {
	const [state, setState] = React.useState<InternalState<T>>({ key: null });

	const close = React.useCallback(() => setState({ key: null }), []);

	const overlay = React.useMemo(() => {
		const makeState = (key: OverlayKey): OverlayState => ({
			isOpen: state.key === key,
			onOpenChange: (isOpen: boolean) => {
				if (!isOpen && state.key === key) close();
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
			open: () => setState({ key }),
			close,
			render: <R>(fn: (state: OverlayState) => R): R | null => {
				if (state.key !== key) return null;
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
			open: (data: T) =>
				setState({ key, selected: data } as { key: DataKey; selected: T }),
			close,
			render: <R>(fn: (data: T, state: OverlayState) => R): R | null => {
				if (state.key !== key) return null;
				return fn((state as { selected: T }).selected, makeState(key));
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
