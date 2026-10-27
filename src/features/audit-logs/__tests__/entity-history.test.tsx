// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EntityAuditHistory } from "../components/entity-history";

const mocks = vi.hoisted(() => ({
	allowed: true,
	useHistory: vi.fn(),
	open: vi.fn(),
	openPage: vi.fn(),
	retry: vi.fn(),
}));
vi.mock("@/shared/session", () => ({
	useOptionalLoggedUserSession: () => ({
		permissions: mocks.allowed ? ["org:audit_logs:read"] : [],
	}),
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
		auditLogs: [
			{
				id: 10,
				occurredAtLabel: "24/10/2026, 12:00",
				action: "UPDATE",
				actorName: "Maria",
				description: "atualizou contrato PROC-60.",
			},
		],
		isPending: false,
		error: null,
		retry: mocks.retry,
		openPage: mocks.openPage,
		details: { open: mocks.open, render: () => null },
	});
});
afterEach(cleanup);

describe("embedded entity audit history", () => {
	it("paginates all loaded history locally in groups of 25 and preserves row IDs", () => {
		const base = mocks.useHistory();
		mocks.useHistory.mockReturnValue({
			...base,
			auditLogs: Array.from({ length: 26 }, (_, index) => ({
				...base.auditLogs[0],
				id: index + 1,
				description: `Alteração ${index + 1}`,
			})),
		});
		const before = window.location.href;
		render(<EntityAuditHistory entityType="Contract" entityId={60} />);
		expect(screen.getAllByRole("row")).toHaveLength(26);
		expect(screen.queryByText("Alteração 26")).toBeNull();
		fireEvent.click(
			screen.getByRole("button", { name: "Ir para a próxima página" }),
		);
		expect(screen.getAllByRole("row")).toHaveLength(2);
		fireEvent.click(screen.getByText("Alteração 26"));
		expect(mocks.open).toHaveBeenCalledWith(26);
		expect(window.location.href).toBe(before);
	});
	it("renders changes in place and keeps pagination off the workspace URL", () => {
		const before = window.location.href;
		render(<EntityAuditHistory entityType="Contract" entityId={60} />);
		expect(mocks.useHistory).toHaveBeenCalledWith("Contract", 60);
		expect(screen.getByRole("table")).not.toBeNull();
		expect(
			screen.getAllByRole("columnheader").map((header) => header.textContent),
		).toEqual(["#", "Ocorrido em", "Ação", "Usuário", "Detalhes"]);
		const row = screen.getAllByRole("row")[1];
		expect(screen.queryByRole("button", { name: "Ações" })).toBeNull();
		fireEvent.click(screen.getByText("atualizou contrato PROC-60."));
		fireEvent.keyDown(row, { key: "Enter" });
		fireEvent.keyDown(row, { key: " " });
		expect(mocks.open).toHaveBeenCalledTimes(3);
		expect(mocks.open).toHaveBeenCalledWith(10);
		expect(window.location.href).toBe(before);
		expect(screen.getByText("Maria")).not.toBeNull();
		expect(
			screen.queryByRole("button", { name: "Ir para a próxima página" }),
		).toBeNull();
		expect(window.location.href).toBe(before);
	});
	it.each(["Ver resumo", "Abrir página"])(
		"opens %s from the row context menu",
		async (label) => {
			render(<EntityAuditHistory entityType="Contract" entityId={60} />);
			fireEvent.contextMenu(screen.getByText("Maria"), {
				clientX: 120,
				clientY: 160,
				button: 2,
			});
			fireEvent.click(await screen.findByRole("menuitem", { name: label }));
			expect(
				label === "Ver resumo" ? mocks.open : mocks.openPage,
			).toHaveBeenCalledWith(10);
			expect(
				label === "Ver resumo" ? mocks.openPage : mocks.open,
			).not.toHaveBeenCalled();
		},
	);
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
			auditLogs: [],
		});
		render(<EntityAuditHistory entityType="Contract" entityId={60} />);
		expect(
			screen.getByText("Nenhuma alteração registrada para este registro."),
		).not.toBeNull();
		expect(
			screen.queryByRole("button", { name: "Ir para a próxima página" }),
		).toBeNull();
	});
});
