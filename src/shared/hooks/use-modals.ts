import * as React from "react";
import type { OverlayState } from "../types/overlay";

type ModalKey = "form" | "delete" | "details" | "restore";

interface ModalState<T> {
	selected: T | undefined;
	openModals: Set<ModalKey>;
}

export function useModals<T>() {
	const [state, setState] = React.useState<ModalState<T>>({
		selected: undefined,
		openModals: new Set(),
	});

	const open = React.useCallback((key: ModalKey, data?: T) => {
		setState((prev) => ({
			selected: data ?? prev.selected,
			openModals: new Set([key]),
		}));
	}, []);

	const close = React.useCallback((key?: ModalKey) => {
		setState((prev) => {
			if (!key) return { selected: undefined, openModals: new Set() };
			const next = new Set(prev.openModals);
			next.delete(key);
			return { ...prev, openModals: next };
		});
	}, []);

	const isOpen = React.useCallback(
		(key: ModalKey) => state.openModals.has(key),
		[state.openModals],
	);

	const reset = React.useCallback(() => {
		setState({ selected: undefined, openModals: new Set() });
	}, []);

	const onOpenChange = React.useCallback((key: ModalKey, value: boolean) => {
		setState((prev) => {
			const next = new Set(prev.openModals);
			if (value) {
				next.add(key);
			} else {
				next.delete(key);
			}
			return { ...prev, openModals: next };
		});
	}, []);

	const stateOf = React.useCallback(
		(key: ModalKey): OverlayState => ({
			isOpen: state.openModals.has(key),
			open: () => open(key),
			close: () => close(key),
			setOpen: (value: boolean) => onOpenChange(key, value),
			toggle: () => onOpenChange(key, !state.openModals.has(key)),
		}),
		[state, open, close, onOpenChange],
	);

	return {
		selected: state.selected,
		open,
		close,
		isOpen,
		onOpenChange,
		reset,
		stateOf,
	};
}
