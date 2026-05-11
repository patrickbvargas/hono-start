import * as React from "react";
import { useIsMobile } from "@/shared/hooks/use-mobile";

export type EntityViewMode = "table" | "list";
export const DEFAULT_ENTITY_VIEW_MODE_STORAGE_KEY = "entity.viewMode";
const ENTITY_VIEW_MODE_CHANGE_EVENT = "entity-view-mode-change";

interface UseEntityViewModeOptions {
	defaultMode?: EntityViewMode;
	mobileMode?: EntityViewMode;
	storageKey?: string;
}

export function useEntityViewMode({
	defaultMode = "table",
	mobileMode = "list",
	storageKey = DEFAULT_ENTITY_VIEW_MODE_STORAGE_KEY,
}: UseEntityViewModeOptions) {
	const isMobile = useIsMobile();
	const readValue = React.useCallback((): EntityViewMode => {
		if (typeof window === "undefined") {
			return defaultMode;
		}

		const stored = window.localStorage.getItem(storageKey);
		return stored ? (JSON.parse(stored) as EntityViewMode) : defaultMode;
	}, [defaultMode, storageKey]);

	const [preferredViewMode, setPreferredViewMode] =
		React.useState<EntityViewMode>(readValue);

	const setStoredPreferredViewMode = React.useCallback<
		React.Dispatch<React.SetStateAction<EntityViewMode>>
	>(
		(nextValue) => {
			setPreferredViewMode((currentValue) => {
				const resolvedValue =
					nextValue instanceof Function ? nextValue(currentValue) : nextValue;

				if (typeof window !== "undefined") {
					window.localStorage.setItem(
						storageKey,
						JSON.stringify(resolvedValue),
					);
					window.dispatchEvent(
						new CustomEvent(ENTITY_VIEW_MODE_CHANGE_EVENT, {
							detail: { storageKey },
						}),
					);
				}

				return resolvedValue;
			});
		},
		[storageKey],
	);

	React.useEffect(() => {
		setPreferredViewMode(readValue());
	}, [readValue]);

	React.useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const handleStorageChange = (event: StorageEvent) => {
			if (event.key !== null && event.key !== storageKey) {
				return;
			}

			setPreferredViewMode(readValue());
		};

		const handleCustomStorageChange = (event: Event) => {
			const customEvent = event as CustomEvent<{ storageKey?: string }>;

			if (customEvent.detail?.storageKey !== storageKey) {
				return;
			}

			setPreferredViewMode(readValue());
		};

		window.addEventListener("storage", handleStorageChange);
		window.addEventListener(
			ENTITY_VIEW_MODE_CHANGE_EVENT,
			handleCustomStorageChange,
		);

		return () => {
			window.removeEventListener("storage", handleStorageChange);
			window.removeEventListener(
				ENTITY_VIEW_MODE_CHANGE_EVENT,
				handleCustomStorageChange,
			);
		};
	}, [readValue, storageKey]);

	const activeViewMode: EntityViewMode = isMobile
		? mobileMode
		: preferredViewMode;

	return {
		activeViewMode,
		isMobile,
		preferredViewMode,
		setPreferredViewMode: setStoredPreferredViewMode,
	};
}
