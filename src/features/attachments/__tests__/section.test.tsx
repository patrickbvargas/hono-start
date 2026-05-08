// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AttachmentSection } from "../components/section";

const useAttachmentsMock = vi.fn();

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
				open: vi.fn(),
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
});
