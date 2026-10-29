// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AttachmentPdfPreview } from "../components/preview/pdf";

const mocks = vi.hoisted(() => ({
	load: vi.fn(),
	getPage: vi.fn(),
	render: vi.fn(),
	cancel: vi.fn(),
	destroy: vi.fn(),
	draw: vi.fn(),
}));
vi.mock("../utils/pdf-engine", () => ({ loadAttachmentPdf: mocks.load }));

beforeEach(() => {
	Object.defineProperty(Element.prototype, "getAnimations", {
		configurable: true,
		value: () => [],
	});
	vi.stubGlobal(
		"ResizeObserver",
		class {
			observe() {}
			disconnect() {}
		},
	);
	vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
		width: 616,
		height: 500,
		x: 0,
		y: 0,
		top: 0,
		left: 0,
		right: 616,
		bottom: 500,
		toJSON: () => ({}),
	});
	vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
		drawImage: mocks.draw,
	} as unknown as CanvasRenderingContext2D);
	mocks.destroy.mockResolvedValue(undefined);
	mocks.render.mockImplementation(() => ({
		promise: Promise.resolve(),
		cancel: mocks.cancel,
	}));
	mocks.getPage.mockResolvedValue({
		getViewport: ({ scale }: { scale: number }) => ({
			width: 600 * scale,
			height: 800 * scale,
		}),
		render: mocks.render,
	});
	mocks.load.mockImplementation(() => ({
		promise: Promise.resolve({ numPages: 3, getPage: mocks.getPage }),
		destroy: mocks.destroy,
	}));
});
afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	vi.clearAllMocks();
});

function mount() {
	const onLoad = vi.fn();
	const onError = vi.fn();
	return {
		...render(
			<AttachmentPdfPreview
				url="blob:document"
				fileName="prova.pdf"
				onLoad={onLoad}
				onError={onError}
			/>,
		),
		onLoad,
		onError,
	};
}

it("renders one page with the shared zoom toolbar and bounded page navigation", async () => {
	const { onLoad, onError } = mount();
	expect(
		screen.getByRole("status", { name: "Carregando página" }),
	).toBeTruthy();
	await waitFor(() => expect(onLoad).toHaveBeenCalledOnce());
	expect(screen.getByRole("group", { name: "Controles do PDF" })).toBeTruthy();
	expect(screen.getByText("1 de 3")).toBeTruthy();
	expect(
		(
			screen.getByRole("button", {
				name: "Página anterior",
			}) as HTMLButtonElement
		).disabled,
	).toBe(true);
	await waitFor(() =>
		expect(
			(
				screen.getByRole("button", {
					name: "Próxima página",
				}) as HTMLButtonElement
			).disabled,
		).toBe(false),
	);
	fireEvent.click(screen.getByRole("button", { name: "Próxima página" }));
	await waitFor(() => expect(onLoad).toHaveBeenCalledTimes(2));
	expect(mocks.getPage).toHaveBeenLastCalledWith(2);
	await waitFor(() =>
		expect(
			(
				screen.getByRole("button", {
					name: "Próxima página",
				}) as HTMLButtonElement
			).disabled,
		).toBe(false),
	);
	fireEvent.click(screen.getByRole("button", { name: "Próxima página" }));
	await waitFor(() => expect(onLoad).toHaveBeenCalledTimes(3));
	expect(
		(
			screen.getByRole("button", {
				name: "Próxima página",
			}) as HTMLButtonElement
		).disabled,
	).toBe(true);
	expect(onError).not.toHaveBeenCalled();
});

it("supports zoom, original size and fit-to-width without native browser controls", async () => {
	const { onLoad } = mount();
	await waitFor(() => expect(onLoad).toHaveBeenCalledOnce());
	expect(screen.getByLabelText("Zoom atual").textContent).toBe("100%");
	fireEvent.click(screen.getByRole("button", { name: "Aumentar zoom" }));
	await waitFor(() =>
		expect(screen.getByLabelText("Zoom atual").textContent).toBe("125%"),
	);
	fireEvent.click(screen.getByRole("button", { name: "100%" }));
	await waitFor(() =>
		expect(screen.getByLabelText("Zoom atual").textContent).toBe("100%"),
	);
	fireEvent.click(screen.getByRole("button", { name: "Ajustar à largura" }));
	await waitFor(() => expect(onLoad).toHaveBeenCalledTimes(4));
	expect(document.querySelector("iframe")).toBeNull();
});

it("cancels rendering and destroys the worker when closed", async () => {
	mocks.render.mockImplementation(() => ({
		promise: new Promise(() => {}),
		cancel: mocks.cancel,
	}));
	const { unmount, onLoad } = mount();
	await waitFor(() => expect(mocks.render).toHaveBeenCalledOnce());
	unmount();
	expect(mocks.cancel).toHaveBeenCalled();
	expect(mocks.destroy).toHaveBeenCalledOnce();
	expect(onLoad).not.toHaveBeenCalled();
});

it("routes invalid/password-protected document errors through safe preview feedback", async () => {
	mocks.load.mockImplementation(() => ({
		promise: Promise.reject(new Error("private parser details")),
		destroy: mocks.destroy,
	}));
	const { onError } = mount();
	await waitFor(() => expect(onError).toHaveBeenCalledOnce());
	expect(screen.queryByText("private parser details")).toBeNull();
});
