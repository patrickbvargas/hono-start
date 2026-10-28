// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import type { SyntheticEvent } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { getAttachmentFileQueryOptions } from "../api/queries";
import { AttachmentPreview } from "../components/preview";
import { AttachmentSectionContent } from "../components/section/content";
import type { AttachmentSummary } from "../schemas/model";

vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => ({
		middleware: () => ({ validator: () => ({ handler: () => vi.fn() }) }),
	}),
}));
vi.mock("@/shared/session/server", () => ({
	authMiddleware: {},
	getRequiredServerLoggedUserSession: vi.fn(),
	getServerScope: vi.fn(),
}));
vi.mock("../data/queries", () => ({
	assertAttachmentOwnerExists: vi.fn(),
	getAttachmentsByOwner: vi.fn(),
}));
vi.mock("../api/access", () => ({ assertAttachmentOwnerReadAccess: vi.fn() }));
vi.mock("../components/preview/pdf", () => ({
	AttachmentPdfPreview: ({
		url,
		fileName,
		onLoad,
		onError,
	}: {
		url: string;
		fileName: string;
		onLoad: (event: SyntheticEvent) => void;
		onError: () => void;
	}) => (
		<canvas
			title={`Visualização de ${fileName}`}
			data-source={url}
			onClick={onLoad}
			onError={onError}
		/>
	),
}));

const attachment: AttachmentSummary = {
	id: 42,
	fileName: "prova.pdf",
	uploadedByName: "Ana",
	fileSize: 100,
	mimeType: "application/pdf",
	typeId: 1,
	type: "PDF",
	typeValue: "PDF",
	downloadUrl: "http://localhost/api/attachments/42",
	isActive: true,
	isSoftDeleted: false,
	createdAt: "2026-10-28T12:00:00.000Z",
	updatedAt: null,
};
const fetchMock = vi.fn();
const printMock = vi.hoisted(() => vi.fn(() => vi.fn()));
vi.mock("../utils/print-image", () => ({ printAttachmentImage: printMock }));
const createUrl = vi.fn();
const revokeUrl = vi.fn();
const clients: QueryClient[] = [];

beforeEach(() => {
	vi.stubGlobal(
		"ResizeObserver",
		class {
			observe() {}
			disconnect() {}
		},
	);
	let sequence = 0;
	createUrl.mockImplementation(() => `blob:preview-${++sequence}`);
	vi.stubGlobal("fetch", fetchMock);
	Object.defineProperty(URL, "createObjectURL", {
		configurable: true,
		value: createUrl,
	});
	Object.defineProperty(URL, "revokeObjectURL", {
		configurable: true,
		value: revokeUrl,
	});
	fetchMock.mockImplementation(() =>
		Promise.resolve(
			new Response("pdf", { headers: { "Content-Type": "application/pdf" } }),
		),
	);
});
afterEach(() => {
	cleanup();
	for (const client of clients) {
		client.clear();
	}
	clients.length = 0;
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
	vi.clearAllMocks();
});

function mount(file = attachment, canDelete = false) {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	clients.push(client);
	const onDelete = vi.fn();
	const onOpenChange = vi.fn();
	const result = render(
		<QueryClientProvider client={client}>
			<AttachmentPreview
				attachment={file}
				canDelete={canDelete}
				onDelete={onDelete}
				triggerRef={{ current: null }}
				state={{ isOpen: true, close: vi.fn(), onOpenChange }}
			/>
		</QueryClientProvider>,
	);
	return { ...result, client, onDelete, onOpenChange };
}

it("loads a private PDF with metadata and revokes its URL on dismissal", async () => {
	const { unmount, onOpenChange } = mount();
	expect(
		screen.getByRole("status", { name: "Carregando anexo" }).textContent,
	).toContain("Carregando anexo");
	const frame = await screen.findByTitle("Visualização de prova.pdf");
	expect(frame.tagName).toBe("CANVAS");
	expect(frame.getAttribute("data-source")).toBe("blob:preview-1");
	expect(screen.getByRole("status", { name: "Carregando anexo" })).toBeTruthy();
	fireEvent.click(frame);
	expect(screen.queryByRole("status", { name: "Carregando anexo" })).toBeNull();
	expect(screen.getByText("Enviado por Ana")).toBeTruthy();
	expect(fetchMock).toHaveBeenCalledWith(
		attachment.downloadUrl,
		expect.objectContaining({
			cache: "no-store",
			credentials: "same-origin",
			signal: expect.any(AbortSignal),
		}),
	);
	fireEvent.click(screen.getByRole("button", { name: "Fechar visualização" }));
	expect(onOpenChange).toHaveBeenCalledWith(false);
	unmount();
	expect(revokeUrl).toHaveBeenCalledWith("blob:preview-1");
});

it.each(["image/jpeg", "image/png"])(
	"fits %s images and recovers from rendering failure",
	async (mimeType) => {
		fetchMock.mockImplementation(() =>
			Promise.resolve(
				new Response("image", { headers: { "Content-Type": mimeType } }),
			),
		);
		mount({
			...attachment,
			mimeType,
			fileName: "imagem",
			typeValue: mimeType === "image/png" ? "PNG" : "JPG",
		});
		const image = await screen.findByRole("img", { name: "imagem" });
		expect(
			screen.getByRole("status", { name: "Carregando anexo" }),
		).toBeTruthy();
		fireEvent.load(image);
		expect(
			screen.queryByRole("status", { name: "Carregando anexo" }),
		).toBeNull();
		expect(image.className).toContain("object-contain");
		fireEvent.error(image);
		expect(screen.getByRole("alert").textContent).toContain(
			"Não foi possível exibir o anexo.",
		);
		fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
		await screen.findByRole("img", { name: "imagem" });
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(revokeUrl).toHaveBeenCalledWith("blob:preview-1");
	},
);

it.each([403, 404, 500])(
	"handles HTTP %i safely and retries explicitly",
	async (status) => {
		fetchMock.mockResolvedValueOnce(
			new Response("private disk path", { status }),
		);
		mount();
		expect((await screen.findByRole("alert")).textContent).toContain(
			"Não foi possível exibir o anexo.",
		);
		expect(screen.queryByText("private disk path")).toBeNull();
		expect(fetchMock).toHaveBeenCalledTimes(1);
		fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
		await screen.findByTitle("Visualização de prova.pdf");
	},
);

it("rejects unsupported delivery and gives safe missing-URL feedback", async () => {
	fetchMock.mockResolvedValue(
		new Response("login page", { headers: { "Content-Type": "text/html" } }),
	);
	const first = mount();
	await screen.findByRole("alert");
	expect(createUrl).not.toHaveBeenCalled();
	first.unmount();
	mount({ ...attachment, downloadUrl: null });
	expect((await screen.findByRole("alert")).textContent).toContain(
		"Visualização indisponível",
	);
	expect(
		(
			screen.getByRole("button", {
				name: "Abrir em nova aba",
			}) as HTMLButtonElement
		).disabled,
	).toBe(true);
	expect(fetchMock).toHaveBeenCalledTimes(1);
});

it("cancels in-flight delivery on unmount and retains no binary cache", async () => {
	fetchMock.mockImplementation(
		(_url, options) =>
			new Promise((_resolve, reject) => {
				options.signal.addEventListener("abort", () =>
					reject(new DOMException("Aborted", "AbortError")),
				);
			}),
	);
	const { unmount, client } = mount();
	await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
	const signal = fetchMock.mock.calls[0][1].signal as AbortSignal;
	unmount();
	expect(signal.aborted).toBe(true);
	await waitFor(() =>
		expect(
			client.getQueryData(getAttachmentFileQueryOptions(attachment).queryKey),
		).toBeUndefined(),
	);
	expect(createUrl).not.toHaveBeenCalled();
});

it.each([false, true])(
	"retains permitted actions: deletion=%s",
	async (canDelete) => {
		const { onDelete } = mount(attachment, canDelete);
		await screen.findByTitle("Visualização de prova.pdf");
		const open = vi.spyOn(window, "open").mockReturnValue(null);
		fireEvent.click(screen.getByRole("button", { name: "Abrir em nova aba" }));
		expect(open).toHaveBeenCalledWith(
			attachment.downloadUrl,
			"_blank",
			"noopener,noreferrer",
		);
		const click = vi
			.spyOn(HTMLAnchorElement.prototype, "click")
			.mockImplementation(function (this: HTMLAnchorElement) {
				expect(this.download).toBe("prova.pdf");
				expect(this.href).toBe(attachment.downloadUrl);
			});
		fireEvent.click(screen.getByRole("button", { name: "Baixar arquivo" }));
		expect(click).toHaveBeenCalledOnce();
		fireEvent.click(screen.getByRole("button", { name: "Ações do anexo" }));
		await screen.findByRole("menu");
		if (canDelete) {
			fireEvent.click(screen.getByRole("menuitem", { name: "Excluir" }));
			expect(onDelete).toHaveBeenCalledWith(42);
		} else {
			expect(screen.queryByRole("menuitem", { name: "Excluir" })).toBeNull();
		}
	},
);

it("opens preview from identity while keeping row actions independent", async () => {
	const onPreview = vi.fn();
	vi.spyOn(window, "open").mockReturnValue(null);
	render(
		<AttachmentSectionContent
			attachment={attachment}
			canDelete={false}
			onDelete={vi.fn()}
			onPreview={onPreview}
		/>,
	);
	const trigger = screen.getByRole("button", { name: "Visualizar prova.pdf" });
	trigger.focus();
	expect(trigger.tagName).toBe("BUTTON");
	fireEvent.click(trigger);
	expect(onPreview).toHaveBeenCalledExactlyOnceWith(trigger);
	onPreview.mockClear();
	fireEvent.click(screen.getByRole("button", { name: "Baixar prova.pdf" }));
	fireEvent.click(screen.getByRole("button", { name: "Ações de prova.pdf" }));
	await screen.findByRole("menu");
	expect(onPreview).not.toHaveBeenCalled();
});

it("enables image printing only after rendering and prints the complete source", async () => {
	fetchMock.mockImplementation(() =>
		Promise.resolve(
			new Response("image", { headers: { "Content-Type": "image/png" } }),
		),
	);
	mount({
		...attachment,
		mimeType: "image/png",
		fileName: "foto.png",
		typeValue: "PNG",
	});
	const image = await screen.findByRole("img", { name: "foto.png" });
	fireEvent.click(screen.getByRole("button", { name: "Ações do anexo" }));
	const print = await screen.findByRole("menuitem", { name: "Imprimir" });
	expect(print.getAttribute("aria-disabled")).toBe("true");
	fireEvent.load(image);
	await waitFor(() =>
		expect(print.getAttribute("aria-disabled")).not.toBe("true"),
	);
	fireEvent.click(print);
	expect(printMock).toHaveBeenCalledWith({
		url: "blob:preview-1",
		fileName: "foto.png",
		onError: expect.any(Function),
	});
});
