// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RemunerationWorkspace } from "../components/workspace";
import { remunerationWorkspaceSearchSchema } from "../schemas/workspace";

const mocks = vi.hoisted(() => ({ workspace: vi.fn() }));
vi.mock("../hooks/use-workspace", () => ({
	useRemunerationWorkspace: mocks.workspace,
}));
vi.mock("@tanstack/react-router", () => ({
	Link: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));
vi.mock("@/features/attachments", () => ({
	AttachmentSection: ({
		ownerId,
		ownerKind,
		canUpload,
		layout,
	}: {
		ownerId: number;
		ownerKind: string;
		canUpload: boolean;
		layout: string;
	}) => (
		<section
			aria-label="Anexos"
			data-owner={ownerKind}
			data-id={ownerId}
			data-upload={String(canUpload)}
			data-layout={layout}
		/>
	),
}));
vi.mock("@/features/audit-logs", () => ({ EntityAuditHistory: () => null }));
vi.mock("@/shared/components/entity-status", () => ({
	EntityStatus: () => null,
}));
vi.mock("@/shared/components/entity-workspace", () => ({
	EntityWorkspace: ({
		sections,
		tab,
	}: {
		sections: Array<{ value: string; label: string; content: ReactNode }>;
		tab: string;
	}) => (
		<>
			<nav data-tab={tab}>
				{sections.map((s) => (
					<span key={s.value}>{s.label}</span>
				))}
			</nav>
			{sections.find((s) => s.value === tab)?.content}
		</>
	),
	EntityWorkspaceHistory: () => null,
}));
vi.mock("../components/details/overview", () => ({
	RemunerationOverview: () => null,
}));
vi.mock("../components/form", () => ({ RemunerationForm: () => null }));
vi.mock("../components/delete", () => ({ RemunerationDelete: () => null }));
vi.mock("../components/restore", () => ({ RemunerationRestore: () => null }));

const baseRecord = {
	id: 9,
	isSoftDeleted: false,
	parentFeeIsSoftDeleted: false,
	contractProcessNumber: "Processo",
	employeeName: "Colaborador",
	contractStatusValue: "COMPLETED",
};
const state = {
	remuneration: baseRecord,
	canReadAttachments: true,
	canEdit: false,
	canDelete: false,
	canRestore: false,
	overlay: {
		edit: { render: () => null },
		delete: { render: () => null },
		restore: { render: () => null },
	},
};
function mount() {
	return render(
		<RemunerationWorkspace
			id={9}
			search={{ tab: "attachments" }}
			onTabChange={vi.fn()}
			onDeleted={vi.fn()}
		/>,
	);
}
describe("Remuneration attachments page", () => {
	beforeEach(() => mocks.workspace.mockReturnValue(state));
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});
	it("validates the attachments tab and rejects invalid tabs", () => {
		expect(
			remunerationWorkspaceSearchSchema.parse({ tab: "attachments" }).tab,
		).toBe("attachments");
		expect(remunerationWorkspaceSearchSchema.parse({ tab: "bad" }).tab).toBe(
			"overview",
		);
	});
	it("renders expanded attachments for its own record even without monetary edit access", () => {
		mount();
		const section = screen.getByRole("region", { name: "Anexos" });
		expect(section.getAttribute("data-owner")).toBe("remuneration");
		expect(section.getAttribute("data-id")).toBe("9");
		expect(section.getAttribute("data-layout")).toBe("expanded");
		expect(section.getAttribute("data-upload")).toBe("true");
	});
	it("hides the section without attachment read permission", () => {
		mocks.workspace.mockReturnValue({ ...state, canReadAttachments: false });
		mount();
		expect(screen.queryByRole("region", { name: "Anexos" })).toBeNull();
		expect(screen.queryByText("Anexos")).toBeNull();
		expect(screen.getByRole("navigation").getAttribute("data-tab")).toBe(
			"overview",
		);
	});
	it("keeps evidence readable but disables upload on a deleted record", () => {
		mocks.workspace.mockReturnValue({
			...state,
			remuneration: { ...baseRecord, isSoftDeleted: true },
		});
		mount();
		expect(
			screen
				.getByRole("region", { name: "Anexos" })
				.getAttribute("data-upload"),
		).toBe("false");
	});
	it("disables upload when the source receipt is deleted", () => {
		mocks.workspace.mockReturnValue({
			...state,
			remuneration: { ...baseRecord, parentFeeIsSoftDeleted: true },
		});
		mount();
		expect(
			screen
				.getByRole("region", { name: "Anexos" })
				.getAttribute("data-upload"),
		).toBe("false");
	});
});
