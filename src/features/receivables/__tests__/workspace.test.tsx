// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	receipts: false,
	attachments: false,
	audit: false,
}));
vi.mock("../../attachments", () => ({
	AttachmentSection: () => <div>Private attachment content</div>,
}));
vi.mock("../../audit-logs", () => ({
	EntityAuditHistory: () => <div>Private audit content</div>,
}));
vi.mock("../components/details/overview", () => ({
	ReceivableOverview: () => <div>Overview content</div>,
}));
vi.mock("../components/details/receipts", () => ({
	ReceivableReceipts: () => <div>Private receipt content</div>,
}));
vi.mock("../hooks/use-workspace", () => ({
	useReceivableWorkspace: () => ({
		receivable: {
			id: 2,
			debtorName: "Devedor",
			situation: "pending",
			createdAt: "2026-11-07",
			updatedAt: "2026-11-07",
		},
		canReadReceipts: mocks.receipts,
		canReadAttachments: mocks.attachments,
		canReadAudit: mocks.audit,
	}),
}));
vi.mock("@tanstack/react-router", () => ({
	Link: ({ children }: { children: React.ReactNode }) => (
		<a href="/contas-a-receber">{children}</a>
	),
}));
vi.mock("@/shared/components/entity-workspace", () => ({
	EntityWorkspace: ({
		sections,
		tab,
	}: {
		sections: Array<{ value: string; label: string; content: React.ReactNode }>;
		tab: string;
	}) => (
		<div>
			<span>Selected: {tab}</span>
			{sections.map((section) => (
				<section key={section.value}>
					<h2>{section.label}</h2>
					{section.value === tab ? section.content : null}
				</section>
			))}
		</div>
	),
	EntityWorkspaceHistory: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}));

import { ReceivableWorkspace } from "../components/workspace";

afterEach(() => {
	cleanup();
	mocks.receipts = false;
	mocks.attachments = false;
	mocks.audit = false;
});
describe("receivable workspace permissions", () => {
	it("falls back to overview without mounting restricted tab contents", () => {
		const change = vi.fn();
		render(
			<ReceivableWorkspace
				id={2}
				search={{ tab: "receipts" }}
				onTabChange={change}
			/>,
		);
		expect(screen.getByText("Selected: overview")).toBeTruthy();
		expect(screen.queryByText("Recebimentos")).toBeNull();
		expect(screen.queryByText("Anexos")).toBeNull();
		expect(screen.queryByText("Private receipt content")).toBeNull();
		expect(change).toHaveBeenCalledWith("overview");
	});
	it("shows authorized tabs but only mounts selected content", () => {
		mocks.receipts = true;
		mocks.attachments = true;
		render(
			<ReceivableWorkspace
				id={2}
				search={{ tab: "receipts" }}
				onTabChange={vi.fn()}
			/>,
		);
		expect(screen.getByText("Private receipt content")).toBeTruthy();
		expect(screen.getByText("Anexos")).toBeTruthy();
		expect(screen.queryByText("Private attachment content")).toBeNull();
	});
});
