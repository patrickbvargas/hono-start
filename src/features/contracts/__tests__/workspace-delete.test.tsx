// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ canDelete: true }));
vi.mock("@/shared/components/wrapper", () => ({
	Wrapper: ({
		children,
		actions,
	}: {
		children: ReactNode;
		actions: ReactNode;
	}) => (
		<main>
			{actions}
			{children}
		</main>
	),
	WrapperBody: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("../schemas/workspace", () => ({
	contractWorkspaceSearchSchema: { parse: () => ({ tab: "overview" }) },
}));
vi.mock("@tanstack/react-router", () => ({
	Link: ({ children }: { children: ReactNode }) => (
		<a href="/contratos">{children}</a>
	),
}));
vi.mock("@/shared/session", () => ({ hasPermission: () => false }));
vi.mock("@/features/attachments", () => ({ AttachmentSection: () => null }));
vi.mock("@/features/audit-logs", () => ({ EntityAuditHistory: () => null }));
vi.mock("@/features/related-records", () => ({
	RelatedRecordLink: ({ children }: { children: ReactNode }) => (
		<span>{children}</span>
	),
}));
vi.mock("@/features/fees", () => ({
	FeeForm: () => null,
	feeSearchDefaults: {},
}));
vi.mock("@/features/remunerations", () => ({ remunerationSearchDefaults: {} }));
vi.mock("../components/form", () => ({ ContractForm: () => null }));
vi.mock("../components/details/revenues", () => ({
	ContractRevenues: () => null,
}));
vi.mock("../components/delete", () => ({
	ContractDelete: ({
		id,
		onSuccess,
		state: overlay,
	}: {
		id: number;
		onSuccess: () => void;
		state: { close: () => void };
	}) => (
		<div role="dialog" aria-label={`Excluir contrato ${id}`}>
			<button type="button" onClick={onSuccess}>
				Confirmar exclusão
			</button>
			<button type="button" onClick={overlay.close}>
				Cancelar
			</button>
		</div>
	),
}));
vi.mock("../hooks/use-workspace", async () => {
	const { useOverlay } = await import("@/shared/hooks/use-overlay");
	return {
		useContractWorkspace: () => ({
			...state,
			...useOverlay<number>(),
			session: {},
			alerts: [],
			selectedRevenue: null,
			canEdit: false,
			canReadFees: false,
			registerReceipt: vi.fn(),
			contract: {
				id: 1,
				processNumber: "PROC-1",
				client: "Cliente",
				legalArea: "Judicial",
				status: "Ativo",
				statusValue: "ACTIVE",
				isActive: true,
				isSoftDeleted: false,
				feePercentage: 0.1,
				allowStatusChange: true,
				createdAt: "2026-10-25T00:00:00Z",
				updatedAt: null,
				notes: null,
				revenues: [],
				assignments: [],
			},
		}),
	};
});

import { ContractWorkspace } from "../components/workspace";
import { contractWorkspaceSearchSchema } from "../schemas/workspace";

beforeEach(() => {
	state.canDelete = true;
});
afterEach(cleanup);
describe("contract workspace deletion", () => {
	it("opens confirmation for the current contract and returns only after success", () => {
		const onDeleted = vi.fn();
		render(
			<ContractWorkspace
				id={1}
				search={contractWorkspaceSearchSchema.parse({})}
				onTabChange={vi.fn()}
				onDeleted={onDeleted}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Excluir contrato" }));
		expect(
			screen.getByRole("dialog", { name: "Excluir contrato 1" }),
		).toBeTruthy();
		expect(onDeleted).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole("button", { name: "Confirmar exclusão" }));
		expect(onDeleted).toHaveBeenCalledOnce();
	});
	it("keeps the contract page when confirmation is cancelled", () => {
		const onDeleted = vi.fn();
		render(
			<ContractWorkspace
				id={1}
				search={contractWorkspaceSearchSchema.parse({})}
				onTabChange={vi.fn()}
				onDeleted={onDeleted}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Excluir contrato" }));
		fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
		expect(screen.queryByRole("dialog")).toBeNull();
		expect(onDeleted).not.toHaveBeenCalled();
	});
	it("hides deletion without lifecycle authority", () => {
		state.canDelete = false;
		render(
			<ContractWorkspace
				id={1}
				search={contractWorkspaceSearchSchema.parse({})}
				onTabChange={vi.fn()}
				onDeleted={vi.fn()}
			/>,
		);
		expect(
			screen.queryByRole("button", { name: "Excluir contrato" }),
		).toBeNull();
	});
});
