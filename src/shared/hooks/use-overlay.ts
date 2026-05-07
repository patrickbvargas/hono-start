import { useCallback, useMemo, useReducer } from "react";
import type { OverlayState } from "@/shared/types/overlay";

type VoidKey = "create";
type DataKey = "edit" | "delete" | "details" | "restore";
type OverlayKey = VoidKey | DataKey;

interface VoidOverlayValue {
	isOpen: boolean;
}

type DataOverlayValue<T> = { isOpen: false } | { isOpen: true; selected: T };

interface InternalState<T> {
	create: VoidOverlayValue;
	edit: DataOverlayValue<T>;
	details: DataOverlayValue<T>;
	delete: DataOverlayValue<T>;
	restore: DataOverlayValue<T>;
}

type OverlayAction<T> =
	| { type: "close-all" }
	| { type: "close-one"; key: OverlayKey }
	| { type: "open-create" }
	| { type: "open-data"; key: DataKey; selected: T };

const overlayKeys: OverlayKey[] = [
	"create",
	"edit",
	"details",
	"delete",
	"restore",
];

function createInitialState<T>(): InternalState<T> {
	return {
		create: { isOpen: false },
		edit: { isOpen: false },
		details: { isOpen: false },
		delete: { isOpen: false },
		restore: { isOpen: false },
	};
}

function overlayReducer<T>(
	state: InternalState<T>,
	action: OverlayAction<T>,
): InternalState<T> {
	switch (action.type) {
		case "close-all":
			return createInitialState<T>();
		case "close-one":
			if (action.key === "create") {
				return {
					...state,
					create: { isOpen: false },
				};
			}

			return {
				...state,
				[action.key]: { isOpen: false },
			};
		case "open-create":
			return {
				...state,
				create: { isOpen: true },
			};
		case "open-data":
			return {
				...state,
				[action.key]: {
					isOpen: true,
					selected: action.selected,
				},
			};
	}
}

function isDataOverlayOpen<T>(
	state: DataOverlayValue<T>,
): state is { isOpen: true; selected: T } {
	return state.isOpen;
}

export function useOverlay<T>() {
	const [state, dispatch] = useReducer(
		overlayReducer<T>,
		createInitialState<T>(),
	);

	const close = useCallback(() => dispatch({ type: "close-all" }), []);

	const overlay = useMemo(() => {
		const makeState = (key: OverlayKey): OverlayState => ({
			isOpen: state[key].isOpen,
			onOpenChange: (isOpen: boolean) => {
				if (!isOpen) {
					dispatch({ type: "close-one", key });
				}
			},
			close: () => dispatch({ type: "close-one", key }),
		});

		const createVoidScope = (key: VoidKey) => ({
			isOpen: state[key].isOpen,
			open: () => dispatch({ type: "open-create" }),
			close: () => dispatch({ type: "close-one", key }),
			render: <R>(fn: (overlayState: OverlayState) => R): R | null => {
				if (!state[key].isOpen) {
					return null;
				}

				return fn(makeState(key));
			},
		});

		const createDataScope = <K extends DataKey>(key: K) => ({
			isOpen: state[key].isOpen,
			open: (data: T) => dispatch({ type: "open-data", key, selected: data }),
			close: () => dispatch({ type: "close-one", key }),
			render: <R>(
				fn: (selected: T, overlayState: OverlayState) => R,
			): R | null => {
				if (!isDataOverlayOpen(state[key])) {
					return null;
				}

				return fn(state[key].selected, makeState(key));
			},
		});

		return {
			create: createVoidScope("create"),
			edit: createDataScope("edit"),
			details: createDataScope("details"),
			delete: createDataScope("delete"),
			restore: createDataScope("restore"),
		};
	}, [state]);

	return {
		/** The keys of the currently open overlays. */
		openKeys: overlayKeys.filter((key) => state[key].isOpen),
		close,
		overlay,
	};
}
