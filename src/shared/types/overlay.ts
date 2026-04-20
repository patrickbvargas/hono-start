export interface OverlayState {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	close: () => void;
}
