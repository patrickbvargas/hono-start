// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { EntityDeleteConfirm } from "@/shared/components/entity-confirmation";
import type { OverlayState } from "@/shared/types/overlay";
import { AttachmentSection } from "../components/section";

vi.mock("../components/preview/pdf", () => ({
	AttachmentPdfPreview: () => <canvas />,
}));

vi.mock("../hooks/use-data", () => ({
	useAttachments: () => ({
		attachments: [
			{
				id: 42,
				fileName: "prova.pdf",
				typeValue: "PDF",
				fileSize: 100,
				createdAt: "2026-10-28T12:00:00Z",
				uploadedByName: "Ana",
				downloadUrl: "/api/attachments/42",
			},
		],
		isPending: false,
		error: null,
	}),
}));
vi.mock("../hooks/use-preview", () => ({
	useAttachmentPreview: () => ({
		url: "blob:test",
		isPdf: true,
		isLoading: false,
		error: null,
		download: vi.fn(),
		openInNewTab: vi.fn(),
		retry: vi.fn(),
		onRenderError: vi.fn(),
	}),
}));
vi.mock("@/shared/session", () => ({
	useLoggedUserSession: () => ({}),
	hasPermission: () => true,
}));
vi.mock("../components/form", () => ({ AttachmentForm: () => null }));
vi.mock("../components/delete", () => ({
	AttachmentDelete: ({
		state,
		onSuccess,
	}: {
		state: OverlayState;
		onSuccess: () => void;
	}) => (
		<EntityDeleteConfirm
			title="Excluir anexo"
			description="Tem certeza que deseja excluir?"
			state={state}
			onConfirm={onSuccess}
			isPending={false}
		/>
	),
}));
afterEach(cleanup);

it("closes preview and returns focus without changing its owner context", async () => {
	render(
		<AttachmentSection ownerId={1} ownerKind="client" canUpload={false} />,
	);
	const trigger = screen.getByRole("button", { name: "Visualizar prova.pdf" });
	trigger.focus();
	fireEvent.click(trigger);
	const dialog = await screen.findByRole("dialog", { name: "prova.pdf" });
	fireEvent.keyDown(dialog, { key: "Escape" });
	await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
	await waitFor(() => expect(document.activeElement).toBe(trigger));
	expect(screen.getByRole("region", { name: "Anexos" })).toBeTruthy();
});

it("preserves preview after deletion cancellation and closes it on confirmed success", async () => {
	render(
		<AttachmentSection ownerId={1} ownerKind="client" canUpload={false} />,
	);
	fireEvent.click(screen.getByRole("button", { name: "Visualizar prova.pdf" }));
	await screen.findByRole("dialog", { name: "prova.pdf" });
	const openDelete = async () => {
		fireEvent.click(screen.getByRole("button", { name: "Ações do anexo" }));
		fireEvent.click(await screen.findByRole("menuitem", { name: "Excluir" }));
		await screen.findByRole("alertdialog", { name: "Excluir anexo" });
	};
	await openDelete();
	fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
	await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
	expect(screen.getByRole("dialog", { name: "prova.pdf" })).toBeTruthy();
	await openDelete();
	fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
	await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
	await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
});
