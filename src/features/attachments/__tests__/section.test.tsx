// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AttachmentSection } from "../components/section";
import { AttachmentSectionContent } from "../components/section/content";
import { AttachmentSectionFallback } from "../components/section/skeleton";

const useAttachmentsMock = vi.fn();
const deleteOpenMock = vi.fn();
const createOpenMock = vi.fn();
const retryMock = vi.fn();
const permissionMock = vi.fn(() => true);

vi.mock("../hooks/use-data", () => ({
	useAttachments: (...args: unknown[]) => useAttachmentsMock(...args),
}));

vi.mock("@/shared/hooks/use-overlay", () => ({
	useOverlay: () => ({
		overlay: {
			create: {
				open: createOpenMock,
				render: () => null,
			},
			delete: {
				open: deleteOpenMock,
				render: () => null,
			},
			details: { open: vi.fn(), close: vi.fn(), render: () => null },
		},
	}),
}));

vi.mock("@/shared/session", () => ({
	useOptionalLoggedUserSession: () => ({
		permissions: ["org:attachments:upload"],
	}),
	hasPermission: () => permissionMock(),
	useLoggedUserSession: () => true,
}));

vi.mock("../components/form", () => ({
	AttachmentForm: () => null,
}));

vi.mock("../components/delete", () => ({
	AttachmentDelete: () => null,
}));

describe("AttachmentSection", () => {
	it("disables unavailable downloads and hides unauthorized deletion", () => {
		render(
			<AttachmentSectionContent
				attachment={{
					id: 1,
					fileName: "arquivo.pdf",
					uploadedByName: null,
					fileSize: 1,
					mimeType: "application/pdf",
					typeId: 1,
					type: "PDF",
					typeValue: "PDF",
					downloadUrl: null,
					isActive: true,
					isSoftDeleted: false,
					createdAt: "2026-05-12T12:00:00.000Z",
					updatedAt: null,
				}}
				canDelete={false}
				onDelete={deleteOpenMock}
				onPreview={vi.fn()}
			/>,
		);
		expect(
			(
				screen.getByRole("button", {
					name: "Baixar arquivo.pdf",
				}) as HTMLButtonElement
			).disabled,
		).toBe(true);
		expect(
			screen.getByRole("button", { name: "Ações de arquivo.pdf" }),
		).toBeTruthy();
		expect(screen.getByText("Autor não informado")).toBeTruthy();
	});
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	beforeEach(() => {
		permissionMock.mockReturnValue(true);
		useAttachmentsMock.mockReturnValue({
			attachments: [],
			error: null,
			isPending: false,
			retry: retryMock,
		});
	});

	it("renders an empty-state-sized detail fallback with upload button space", () => {
		render(<AttachmentSectionFallback canUpload />);
		expect(useAttachmentsMock).not.toHaveBeenCalled();
		expect(screen.queryByRole("button")).toBeNull();
		expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBe(5);
	});

	it("omits upload button space when uploads are unavailable", () => {
		render(<AttachmentSectionFallback canUpload={false} />);
		expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBe(4);
	});

	it("renders one heading and opens upload from the compact header", () => {
		render(<AttachmentSection ownerId={1} ownerKind="client" />);

		expect(screen.getAllByRole("heading", { name: "Anexos" })).toHaveLength(1);
		fireEvent.click(screen.getByRole("button", { name: "Anexar" }));
		expect(createOpenMock).toHaveBeenCalledOnce();
	});

	it("keeps empty copy compact and matches loading to the padded attachment row", () => {
		const { rerender, container } = render(
			<AttachmentSection ownerId={1} ownerKind="client" />,
		);
		expect(screen.getByText("Nenhum anexo cadastrado.").className).toContain(
			"leading-5",
		);
		useAttachmentsMock.mockReturnValue({
			attachments: [],
			error: null,
			isPending: true,
			retry: retryMock,
		});
		rerender(<AttachmentSection ownerId={1} ownerKind="client" />);
		expect(
			container.querySelector('div.h-16[aria-hidden="true"]')?.className,
		).toContain("py-1");
	});

	it("expands attachments in the workspace while retaining compact drawer scrolling", () => {
		useAttachmentsMock.mockReturnValue({
			attachments: [
				{
					id: 1,
					fileName: "arquivo.pdf",
					fileSize: 1024,
					typeValue: "PDF",
					createdAt: "2026-10-24T12:00:00Z",
					downloadUrl: null,
				},
			],
			error: null,
			isPending: false,
			retry: retryMock,
		});
		const { rerender, container } = render(
			<AttachmentSection ownerId={1} ownerKind="contract" />,
		);
		expect(
			container.querySelector('[data-slot="scroll-area"]')?.className,
		).toContain("max-h-56");
		expect(screen.getByRole("listitem").className).toContain("min-h-16");
		expect(screen.getByRole("listitem").className).toContain("py-1");
		rerender(
			<AttachmentSection ownerId={1} ownerKind="contract" layout="expanded" />,
		);
		expect(
			container.querySelector('[data-slot="scroll-area"]')?.className,
		).toContain("flex-auto");
		expect(screen.getByRole("region", { name: "Anexos" }).className).toContain(
			"max-h-full",
		);
		expect(
			screen.getByRole("region", { name: "Anexos" }).className,
		).not.toContain("h-full min-h-40");
		expect(screen.getByRole("listitem")).not.toBeNull();
	});

	it("renders skeleton placeholders while attachments are loading", () => {
		useAttachmentsMock.mockReturnValue({
			attachments: [],
			error: null,
			isPending: true,
		});

		render(<AttachmentSection ownerId={1} ownerKind="contract" />);

		expect(screen.queryByText("Carregando anexos...")).toBeNull();
		expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBe(4);
	});

	it("renders metadata, downloads and opens deletion through the menu", async () => {
		useAttachmentsMock.mockReturnValue({
			attachments: [
				{
					id: 1,
					fileName: "contrato.pdf",
					uploadedByName: "Maria",
					fileSize: 1536,
					mimeType: "application/pdf",
					typeId: 1,
					type: "PDF",
					typeValue: "PDF",
					downloadUrl: "https://example.com/contrato.pdf",
					isActive: true,
					isSoftDeleted: false,
					createdAt: "2026-05-12T12:00:00.000Z",
					updatedAt: null,
				},
			],
			error: null,
			isPending: false,
			retry: retryMock,
		});

		render(<AttachmentSection ownerId={1} ownerKind="client" />);

		expect(screen.getByText("contrato.pdf")).toBeTruthy();
		expect(screen.getByText("Enviado por Maria")).toBeTruthy();
		expect(screen.getByText("Enviado por Maria").closest("p")).toBe(
			screen.getByText("1.5 KB").closest("p"),
		);
		expect(screen.getByText("Enviado por Maria").className).toContain(
			"truncate",
		);

		expect(screen.getByText("Tamanho:")).toBeTruthy();
		expect(screen.getByText("1.5 KB")).toBeTruthy();
		expect(screen.getByText("Anexado em")).toBeTruthy();
		expect(
			screen.getByRole("button", { name: "Baixar contrato.pdf" }),
		).toBeTruthy();
		const open = vi.spyOn(window, "open").mockImplementation(() => null);
		fireEvent.click(
			screen.getByRole("button", { name: "Baixar contrato.pdf" }),
		);
		expect(open).toHaveBeenCalledWith(
			"https://example.com/contrato.pdf",
			"_blank",
			"noopener,noreferrer",
		);
		open.mockRestore();
		fireEvent.click(
			screen.getByRole("button", { name: "Ações de contrato.pdf" }),
		);
		fireEvent.click(await screen.findByRole("menuitem", { name: "Excluir" }));
		expect(deleteOpenMock).toHaveBeenCalledWith(1);
	});

	it.each([10, 25])(
		"disables upload at %i existing attachments without hiding them",
		(count) => {
			useAttachmentsMock.mockReturnValue({
				attachments: Array.from({ length: count }, (_, id) => ({
					id,
					fileName: `file-${id}.pdf`,
					fileSize: 100,
					typeValue: "PDF",
					createdAt: "2026-10-24T12:00:00Z",
					downloadUrl: null,
					uploadedByName: null,
				})),
				error: null,
				isPending: false,
				retry: retryMock,
			});
			render(<AttachmentSection ownerId={1} ownerKind="client" />);
			expect(
				(screen.getByRole("button", { name: "Anexar" }) as HTMLButtonElement)
					.disabled,
			).toBe(true);
			expect(screen.getAllByRole("listitem")).toHaveLength(count);
		},
	);

	it("hides upload without permission or when unavailable", () => {
		permissionMock.mockReturnValue(false);
		const { rerender } = render(
			<AttachmentSection ownerId={1} ownerKind="client" />,
		);
		expect(screen.queryByRole("button", { name: "Anexar" })).toBeNull();
		permissionMock.mockReturnValue(true);
		rerender(
			<AttachmentSection ownerId={1} ownerKind="client" canUpload={false} />,
		);
		expect(screen.queryByRole("button", { name: "Anexar" })).toBeNull();
	});

	it("shows a safe error and retries loading", () => {
		useAttachmentsMock.mockReturnValue({
			attachments: [],
			error: new Error("internal detail"),
			isPending: false,
			retry: retryMock,
		});
		render(<AttachmentSection ownerId={1} ownerKind="client" />);
		expect(screen.getByRole("alert").textContent).toContain(
			"Não foi possível carregar anexos.",
		);
		expect(screen.queryByText("internal detail")).toBeNull();
		const retryButton = screen.getByRole("button", {
			name: "Tentar novamente",
		});
		expect(retryButton.getAttribute("type")).toBe("button");
		expect(retryButton.className).toContain("h-7");
		fireEvent.click(retryButton);
		expect(retryMock).toHaveBeenCalledOnce();
	});
});
