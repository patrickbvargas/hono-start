// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EntityAuditHistory } from "../components/entity-history";

const mocks = vi.hoisted(() => ({
	allowed: true,
	useHistory: vi.fn(),
	setPage: vi.fn(),
	open: vi.fn(),
	retry: vi.fn(),
}));
vi.mock("@/shared/session", () => ({
	useLoggedUserSession: () => ({
		permissions: mocks.allowed ? ["org:audit_logs:read"] : [],
	}),
	hasPermission: (session: { permissions: string[] }, key: string) =>
		session.permissions.includes(key),
}));
vi.mock("../hooks/use-entity-history", () => ({
	useEntityHistory: (...args: unknown[]) => mocks.useHistory(...args),
}));
vi.mock("../components/details", () => ({ AuditLogDetails: () => null }));

beforeEach(() => {
	vi.clearAllMocks();
	mocks.allowed = true;
	mocks.useHistory.mockReturnValue({
		auditLogs: {
			data: [
				{
					id: 10,
					occurredAtLabel: "24/10/2026, 12:00",
					action: "UPDATE",
					actorName: "Maria",
					description: "atualizou contrato PROC-60.",
				},
			],
			total: 21,
		},
		isPending: false,
		error: null,
		retry: mocks.retry,
		page: 1,
		setPage: mocks.setPage,
		limit: 10,
		details: { open: mocks.open, render: () => null },
	});
});
afterEach(cleanup);

describe("embedded entity audit history", () => {
	it("renders changes in place and keeps pagination off the workspace URL", () => {
		const before = window.location.href;
		render(<EntityAuditHistory entityType="Contract" entityId={60} />);
		expect(mocks.useHistory).toHaveBeenCalledWith("Contract", 60);
		expect(screen.getByRole("table")).not.toBeNull();
		expect(screen.getByText("Maria")).not.toBeNull();
		fireEvent.click(
			screen.getByRole("button", { name: "Próxima página do histórico" }),
		);
		expect(mocks.setPage).toHaveBeenCalledWith(2);
		expect(window.location.href).toBe(before);
		fireEvent.click(screen.getByRole("button", { name: "Ver alteração #10" }));
		expect(mocks.open).toHaveBeenCalledWith(10);
	});
	it("does not mount the history query without audit access", () => {
		mocks.allowed = false;
		render(<EntityAuditHistory entityType="Contract" entityId={60} />);
		expect(mocks.useHistory).not.toHaveBeenCalled();
		expect(screen.queryByRole("table")).toBeNull();
	});
	it("shows a safe error and allows retry", () => {
		mocks.useHistory.mockReturnValue({
			...mocks.useHistory(),
			error: new Error("private database detail"),
		});
		render(<EntityAuditHistory entityType="Contract" entityId={60} />);
		expect(screen.getByRole("alert").textContent).not.toContain(
			"private database detail",
		);
		fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
		expect(mocks.retry).toHaveBeenCalledOnce();
	});
	it("shows an empty history without pagination controls", () => {
		mocks.useHistory.mockReturnValue({
			...mocks.useHistory(),
			auditLogs: { data: [], total: 0 },
		});
		render(<EntityAuditHistory entityType="Contract" entityId={60} />);
		expect(
			screen.getByText("Nenhuma alteração registrada para este contrato."),
		).not.toBeNull();
		expect(
			screen.queryByRole("button", { name: "Próxima página do histórico" }),
		).toBeNull();
	});
});
