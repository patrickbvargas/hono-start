import { useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";

declare module "@tanstack/react-router" {
	interface HistoryState {
		resetFilterPanel?: boolean;
	}
}

/** Collection navigation collapses filters even when the destination route is reused. */
export function useFilterPanel() {
	const resetKey = useLocation({
		select: (location) =>
			location.state.resetFilterPanel ? location.state.__TSR_key : undefined,
	});
	const [isOpen, setIsOpen] = useState(false);
	useEffect(() => {
		if (resetKey) {
			setIsOpen(false);
		}
	}, [resetKey]);
	return [isOpen, setIsOpen] as const;
}
