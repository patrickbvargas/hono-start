// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { printAttachmentImage } from "../utils/print-image";
import { printAttachmentPdf } from "../utils/print-pdf";

afterEach(() => {
	document.body.replaceChildren();
	vi.restoreAllMocks();
});

it("prints only the complete image after loading and cleans up after print", () => {
	const fail = vi.fn();
	printAttachmentImage({
		url: "blob:full-image",
		fileName: "<contrato>.png",
		onError: fail,
	});
	const frame = document.querySelector("iframe");
	expect(frame).toBeTruthy();
	if (!frame?.contentWindow || !frame.contentDocument) {
		throw new Error("Missing print frame");
	}
	const printWindow = frame.contentWindow;
	const print = vi.spyOn(printWindow, "print").mockImplementation(() => {});
	vi.spyOn(printWindow, "focus").mockImplementation(() => {});
	frame.dispatchEvent(new Event("load"));
	expect(print).not.toHaveBeenCalled();
	const image = frame.contentDocument.querySelector("img");
	expect(image?.getAttribute("src")).toBe("blob:full-image");
	expect(frame.contentDocument.title).toBe("<contrato>.png");
	expect(frame.contentDocument.body.children).toHaveLength(1);
	expect(image?.style.transform).toBe("");
	image?.dispatchEvent(new Event("load"));
	expect(print).toHaveBeenCalledOnce();
	printWindow.dispatchEvent(new Event("afterprint"));
	expect(document.querySelector("iframe")).toBeNull();
	expect(fail).not.toHaveBeenCalled();
});

it("prepares the complete PDF for native printing and cleans up afterward", () => {
	const onError = vi.fn();
	printAttachmentPdf({ url: "blob:pdf", fileName: "prova.pdf", onError });
	const frame = document.querySelector("iframe");
	if (!frame?.contentWindow) {
		throw new Error("Missing PDF print frame");
	}
	expect(frame.getAttribute("src")).toBe("blob:pdf");
	const printWindow = frame.contentWindow;
	const print = vi.spyOn(printWindow, "print").mockImplementation(() => {});
	vi.spyOn(printWindow, "focus").mockImplementation(() => {});
	frame.dispatchEvent(new Event("load"));
	expect(print).toHaveBeenCalledOnce();
	printWindow.dispatchEvent(new Event("afterprint"));
	expect(document.querySelector("iframe")).toBeNull();
	expect(onError).not.toHaveBeenCalled();
});

it("reports image errors and supports cleanup before loading", () => {
	const fail = vi.fn();
	const cancel = printAttachmentImage({
		url: "blob:missing",
		fileName: "foto.png",
		onError: fail,
	});
	const frame = document.querySelector("iframe");
	frame?.dispatchEvent(new Event("load"));
	frame?.contentDocument
		?.querySelector("img")
		?.dispatchEvent(new Event("error"));
	expect(fail).toHaveBeenCalledOnce();
	expect(document.querySelector("iframe")).toBeNull();
	cancel();
	const cleanup = printAttachmentImage({
		url: "blob:next",
		fileName: "foto.png",
		onError: fail,
	});
	cleanup();
	expect(document.querySelector("iframe")).toBeNull();
});
