import type { OverlayState } from "@/shared/types/overlay";

interface DrilldownControllerOptions {
	state: OverlayState;
	returnFocus?:
		| HTMLElement
		| SVGElement
		| (() => HTMLElement | SVGElement | null)
		| null;
}

export function useDrilldownController({
	state,
	returnFocus,
}: DrilldownControllerOptions) {
	const restoreFocus = () => {
		const target =
			typeof returnFocus === "function" ? returnFocus() : returnFocus;
		if (target?.isConnected) {
			target.focus();
		}
	};
	const handleOpenChange = (isOpen: boolean) => {
		state.onOpenChange(isOpen);
		if (!isOpen && returnFocus) {
			requestAnimationFrame(restoreFocus);
		}
	};
	return { handleOpenChange, restoreFocus };
}
