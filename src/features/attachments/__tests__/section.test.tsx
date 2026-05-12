// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AttachmentSection } from "../components/section";

const useAttachmentsMock = vi.fn();
const deleteOpenMock = vi.fn();

vi.mock("../hooks/use-data", () => ({
	useAttachments: (...args: unknown[]) => useAttachmentsMock(...args),
}));

vi.mock("@/shared/hooks/use-overlay", () => ({
	useOverlay: () => ({
		overlay: {
			create: {
				open: vi.fn(),
				render: () => null,
			},
			delete: {
				open: deleteOpenMock,
				render: () => null,
			},
		},
	}),
}));

vi.mock("@/shared/session", () => ({
	isAdminSession: () => true,
	useLoggedUserSessionStore: () => true,
}));

vi.mock("../components/form", () => ({
	AttachmentForm: () => null,
}));

vi.mock("../components/delete", () => ({
	AttachmentDelete: () => null,
}));

describe("AttachmentSection", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	beforeEach(() => {
		useAttachmentsMock.mockReturnValue({
			attachments: [],
			error: null,
			isPending: false,
		});
	});

	it("renders content actions without rendering its own title", () => {
		render(<AttachmentSection ownerId={1} ownerKind="client" />);

		expect(screen.queryByText("Anexos")).toBeNull();
		expect(screen.getByRole("button", { name: "Novo anexo" })).not.toBeNull();
	});

	it("renders skeleton placeholders while attachments are loading", () => {
		useAttachmentsMock.mockReturnValue({
			attachments: [],
			error: null,
			isPending: true,
		});

		render(<AttachmentSection ownerId={1} ownerKind="contract" />);

		expect(screen.queryByText("Carregando anexos...")).toBeNull();
		expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBe(10);
	});

	it("renders attachments in accordion rows with metadata in expanded content", () => {
		useAttachmentsMock.mockReturnValue({
			attachments: [
				{
					id: 1,
					fileName: "contrato.pdf",
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
		});

		render(<AttachmentSection ownerId={1} ownerKind="client" />);

		expect(screen.getByRole("button", { name: "contrato.pdf" })).toBeTruthy();
		expect(screen.queryByText("Tamanho")).toBeNull();

		fireEvent.click(screen.getByRole("button", { name: "contrato.pdf" }));

		expect(screen.getByText("Tipo")).toBeTruthy();
		expect(screen.getByText("PDF")).toBeTruthy();
		expect(screen.getByText("Tamanho")).toBeTruthy();
		expect(screen.getByText("1.5 KB")).toBeTruthy();
		expect(screen.getByText("Anexado em")).toBeTruthy();
		expect(
			screen.getByRole("button", { name: "Baixar contrato.pdf" }),
		).toBeTruthy();
		expect(
			screen.getByRole("button", { name: "Excluir contrato.pdf" }),
		).toBeTruthy();

		fireEvent.click(
			screen.getByRole("button", { name: "Excluir contrato.pdf" }),
		);

		expect(deleteOpenMock).toHaveBeenCalledWith(1);
	});
});
