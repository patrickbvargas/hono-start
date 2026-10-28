// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AttachmentSectionContent } from "../components/section/content";
import type { AttachmentSummary } from "../schemas/model";

const attachment: AttachmentSummary = {
	id: 42,
	fileName: "prova.pdf",
	uploadedByName: "Ana",
	fileSize: 100,
	mimeType: "application/pdf",
	typeId: 1,
	type: "PDF",
	typeValue: "PDF",
	downloadUrl: "/api/attachments/42",
	isActive: true,
	isSoftDeleted: false,
	createdAt: "2026-10-26T12:00:00.000Z",
	updatedAt: null,
};
afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

async function openMenu(presentation: "context" | "dropdown") {
	if (presentation === "context") {
		fireEvent.contextMenu(screen.getByLabelText("Anexo prova.pdf"), {
			button: 2,
		});
	} else {
		fireEvent.click(screen.getByRole("button", { name: "Ações de prova.pdf" }));
	}
	return screen.findByRole("menu");
}

it.each(["context", "dropdown"] as const)(
	"offers equivalent attachment actions through %s",
	async (presentation) => {
		const onDelete = vi.fn();
		const open = vi.spyOn(window, "open").mockImplementation(() => null);
		render(
			<AttachmentSectionContent
				attachment={attachment}
				canDelete
				onDelete={onDelete}
				onPreview={vi.fn()}
			/>,
		);
		await openMenu(presentation);
		expect(
			screen.getAllByRole("menuitem").map((item) => item.textContent),
		).toEqual(["Visualizar", "Baixar", "Excluir"]);
		fireEvent.click(screen.getByRole("menuitem", { name: "Baixar" }));
		expect(open).toHaveBeenCalledExactlyOnceWith(
			"/api/attachments/42",
			"_blank",
			"noopener,noreferrer",
		);
		await openMenu(presentation);
		fireEvent.click(screen.getByRole("menuitem", { name: "Excluir" }));
		expect(onDelete).toHaveBeenCalledExactlyOnceWith(42);
	},
);

it.each(["context", "dropdown"] as const)(
	"opens preview through %s and returns the identity trigger",
	async (presentation) => {
		const onPreview = vi.fn();
		render(
			<AttachmentSectionContent
				attachment={attachment}
				canDelete={false}
				onDelete={vi.fn()}
				onPreview={onPreview}
			/>,
		);
		await openMenu(presentation);
		fireEvent.click(screen.getByRole("menuitem", { name: "Visualizar" }));
		expect(onPreview).toHaveBeenCalledExactlyOnceWith(
			screen.getByRole("button", { name: "Visualizar prova.pdf" }),
		);
	},
);

it.each(["context", "dropdown"] as const)(
	"disables unavailable download and omits deletion through %s",
	async (presentation) => {
		render(
			<AttachmentSectionContent
				attachment={{ ...attachment, downloadUrl: null }}
				canDelete={false}
				onDelete={vi.fn()}
				onPreview={vi.fn()}
			/>,
		);
		await openMenu(presentation);
		expect(
			screen
				.getByRole("menuitem", { name: "Baixar" })
				.getAttribute("aria-disabled"),
		).toBe("true");
		expect(screen.queryByRole("menuitem", { name: "Excluir" })).toBeNull();
	},
);

it.each([{ key: "F10", shiftKey: true }, { key: "ContextMenu" }])(
	"supports keyboard and Escape focus: %o",
	async (event) => {
		render(
			<AttachmentSectionContent
				attachment={attachment}
				canDelete={false}
				onDelete={vi.fn()}
				onPreview={vi.fn()}
			/>,
		);
		const trigger = screen.getByLabelText("Anexo prova.pdf");
		trigger.focus();
		fireEvent.keyDown(trigger, event);
		fireEvent.keyDown(await screen.findByRole("menu"), { key: "Escape" });
		await waitFor(() => expect(document.activeElement).toBe(trigger));
	},
);
