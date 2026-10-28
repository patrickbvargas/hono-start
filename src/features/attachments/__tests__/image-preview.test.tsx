// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AttachmentImagePreview } from "../components/preview/image";

beforeEach(() => {
	vi.stubGlobal(
		"PointerEvent",
		class extends MouseEvent {
			pointerId: number;
			constructor(type: string, options: PointerEventInit = {}) {
				super(type, options);
				this.pointerId = options.pointerId ?? 1;
			}
		},
	);
	vi.stubGlobal(
		"ResizeObserver",
		class {
			observe() {}
			disconnect() {}
		},
	);
	vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
		width: 500,
		height: 400,
		top: 0,
		left: 0,
		right: 500,
		bottom: 400,
		x: 0,
		y: 0,
		toJSON: () => ({}),
	});
});
afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

function mount() {
	const onLoad = vi.fn();
	render(
		<AttachmentImagePreview
			url="blob:image"
			fileName="foto.png"
			onLoad={onLoad}
			onError={vi.fn()}
		/>,
	);
	const image = screen.getByRole("img") as HTMLImageElement;
	Object.defineProperties(image, {
		naturalWidth: { value: 1000 },
		naturalHeight: { value: 800 },
	});
	fireEvent.load(image);
	return { image, onLoad };
}

it("fits initially, zooms to original pixels and resets positioning", () => {
	const { image, onLoad } = mount();
	expect(onLoad).toHaveBeenCalledOnce();
	expect(screen.getByLabelText("Zoom atual").textContent).toBe("50%");
	fireEvent.click(screen.getByRole("button", { name: "Aumentar zoom" }));
	expect(screen.getByLabelText("Zoom atual").textContent).toBe("75%");
	fireEvent.click(screen.getByRole("button", { name: "100%" }));
	expect(image.style.transform).toContain("scale(1)");
	fireEvent.keyDown(screen.getByRole("region"), { key: "ArrowRight" });
	expect(image.style.transform).toContain("translate(-40px, 0px)");
	fireEvent.click(screen.getByRole("button", { name: "Ajustar à tela" }));
	expect(image.style.transform).toContain("translate(0px, 0px) scale(0.5)");
});

it("limits zoom and keeps keyboard panning inside the image bounds", () => {
	const { image } = mount();
	const plus = screen.getByRole("button", { name: "Aumentar zoom" });
	for (let index = 0; index < 40; index++) {
		fireEvent.click(plus);
	}
	expect(screen.getByLabelText("Zoom atual").textContent).toBe("800%");
	expect((plus as HTMLButtonElement).disabled).toBe(true);
	fireEvent.click(screen.getByRole("button", { name: "100%" }));
	for (let index = 0; index < 20; index++) {
		fireEvent.keyDown(screen.getByRole("region"), { key: "ArrowRight" });
	}
	expect(image.style.transform).toContain("translate(-250px, 0px)");
	const minus = screen.getByRole("button", { name: "Diminuir zoom" });
	for (let index = 0; index < 10; index++) {
		fireEvent.click(minus);
	}
	expect(screen.getByLabelText("Zoom atual").textContent).toBe("10%");
	expect((minus as HTMLButtonElement).disabled).toBe(true);
});

it("captures dragging, clamps movement and stops after cancellation", () => {
	const { image } = mount();
	const capture = vi.fn();
	Object.defineProperty(image, "setPointerCapture", { value: capture });
	fireEvent.click(screen.getByRole("button", { name: "100%" }));
	fireEvent.pointerDown(image, {
		pointerId: 7,
		button: 0,
		clientX: 100,
		clientY: 100,
	});
	expect(capture).toHaveBeenCalledWith(7);
	fireEvent.pointerMove(image, { pointerId: 7, clientX: 1000, clientY: 1000 });
	expect(image.style.transform).toContain("translate(250px, 200px)");
	fireEvent.pointerCancel(image, { pointerId: 7 });
	fireEvent.pointerMove(image, { pointerId: 7, clientX: 0, clientY: 0 });
	expect(image.style.transform).toContain("translate(250px, 200px)");
});
