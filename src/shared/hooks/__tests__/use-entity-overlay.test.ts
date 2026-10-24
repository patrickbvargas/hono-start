import { describe, expect, it, vi } from "vitest";
import type { OverlayState } from "@/shared/types/overlay";

const { localOverlay } = vi.hoisted(() => ({
	localOverlay: {
		create: { open: vi.fn() },
		edit: { open: vi.fn() },
		delete: { open: vi.fn() },
		restore: { open: vi.fn() },
	},
}));

vi.mock("../use-overlay", () => ({
	useOverlay: () => ({ overlay: localOverlay }),
}));

import { useEntityOverlay } from "../use-entity-overlay";

describe("URL-selected entity details", () => {
	it("opens the exact requested record without requiring a list row", () => {
		const change = vi.fn();
		const { overlay } = useEntityOverlay(42, change);
		expect(overlay.details.isOpen).toBe(true);
		expect(overlay.details.render((id) => id)).toBe(42);
		expect(change).not.toHaveBeenCalled();
		expect(
			useEntityOverlay(43, change).overlay.details.render((id) => id),
		).toBe(43);
	});

	it("leaves details closed without a URL selection and writes list selections", () => {
		const change = vi.fn();
		const { overlay } = useEntityOverlay(undefined, change);
		expect(overlay.details.isOpen).toBe(false);
		expect(overlay.details.render(vi.fn())).toBeNull();
		overlay.details.open(7);
		expect(change).toHaveBeenCalledWith(7);
	});

	it("clears the URL selection on drawer dismissal without closing mutation overlays", () => {
		const change = vi.fn();
		const { overlay } = useEntityOverlay(42, change);
		let state: OverlayState | undefined;
		overlay.details.render((_id, value) => {
			state = value;
		});
		state?.onOpenChange(true);
		expect(change).not.toHaveBeenCalled();
		state?.onOpenChange(false);
		expect(change).toHaveBeenCalledWith(undefined);
		state?.close();
		overlay.details.close();
		expect(change).toHaveBeenCalledTimes(3);
		expect(overlay.edit).toBe(localOverlay.edit);
		expect(overlay.create).toBe(localOverlay.create);
		expect(overlay.delete).toBe(localOverlay.delete);
		expect(overlay.restore).toBe(localOverlay.restore);
	});
});
