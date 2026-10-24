import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useOverlay } from "./use-overlay";

/** Route-owned details are addressable; mutation overlays retain local state. */
export function useEntityOverlay(
	detailId: EntityId | undefined,
	onDetailChange: (id: EntityId | undefined) => void,
) {
	const { overlay } = useOverlay<EntityId>();
	const close = () => onDetailChange(undefined);
	return {
		overlay: {
			...overlay,
			details: {
				isOpen: detailId !== undefined,
				open: (id: EntityId) => onDetailChange(id),
				close,
				render: <R>(
					render: (id: EntityId, state: OverlayState) => R,
				): R | null =>
					detailId === undefined
						? null
						: render(detailId, {
								isOpen: true,
								close,
								onOpenChange: (isOpen) => {
									if (!isOpen) {
										close();
									}
								},
							}),
			},
		},
	};
}
