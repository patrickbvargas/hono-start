// @vitest-environment jsdom

import { createColumnHelper } from "@tanstack/react-table";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuditLogTable } from "@/features/audit-logs/components/table";
import { ClientTable } from "@/features/clients/components/table";
import type { dataTableFeatures } from "@/shared/lib/table";
import { DataTable } from "../data-table";
import { EntityActions } from "../entity-actions";

const access = vi.hoisted(() => ({ grants: new Set<string>() }));
vi.mock("@/shared/session", () => ({
	useOptionalLoggedUserSession: () => null,
	hasPermission: (_session: unknown, permission: string) =>
		access.grants.has(permission),
}));
vi.mock("@tanstack/react-router", () => ({
	Link: ({ children }: React.PropsWithChildren) => (
		<a href="#sort">{children}</a>
	),
}));
vi.mock("@/shared/hooks/use-sort", () => ({
	useSort: () => ({
		column: undefined,
		direction: "asc",
		getSortSearch: () => ({}),
	}),
}));
vi.mock("@/shared/hooks/use-pagination", () => ({
	usePagination: () => ({
		page: 1,
		limit: 10,
		getPaginationSearch: () => ({}),
		handlePageSizeChange: vi.fn(),
	}),
}));

afterEach(cleanup);
beforeEach(() => {
	access.grants = new Set([
		"org:clients:read",
		"org:clients:update",
		"org:clients:delete",
		"org:clients:restore",
	]);
});

const helper = createColumnHelper<typeof dataTableFeatures, { name: string }>();
const columns = [helper.accessor("name", { header: "Nome" })];
const records = [{ name: "Ana" }, { name: "Zeca" }, { name: "Bia" }];

function openContext(element: HTMLElement) {
	fireEvent.contextMenu(element, { clientX: 120, clientY: 160, button: 2 });
	return screen.findByRole("menu");
}

function renderClient(isSoftDeleted = false) {
	const onOpenPage = vi.fn();
	const onView = vi.fn();
	const onEdit = vi.fn();
	const onDelete = vi.fn();
	const onRestore = vi.fn();
	const result = render(
		<ClientTable
			canManageLifecycle
			data={{
				data: [
					{
						id: 42,
						fullName: "Ana",
						document: "12345678901",
						type: "Pessoa física",
						contractCount: 0,
						isActive: true,
						isSoftDeleted,
					},
				],
				total: 1,
				page: 1,
				pageSize: 10,
			}}
			onOpenPage={onOpenPage}
			onView={onView}
			onEdit={onEdit}
			onDelete={onDelete}
			onRestore={onRestore}
		/>,
	);
	return { ...result, onOpenPage, onView, onEdit, onDelete, onRestore };
}

describe("row context menus", () => {
	it("opens at right click with the same client actions and targets its persisted ID", async () => {
		const { container, onView, onOpenPage } = renderClient();
		expect(container.querySelector("tbody")?.children[0].tagName).toBe("TR");
		await openContext(screen.getByText("Ana"));
		const names = screen
			.getAllByRole("menuitem")
			.map((item) => item.textContent);
		expect(names).toEqual(["Abrir página", "Ver resumo", "Editar", "Excluir"]);
		expect(onOpenPage).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole("menuitem", { name: "Ver resumo" }));
		expect(onView).toHaveBeenCalledExactlyOnceWith(42);
		expect(onOpenPage).not.toHaveBeenCalled();
		await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
		fireEvent.click(screen.getByRole("button", { name: "Ações" }));
		expect(
			screen.getAllByRole("menuitem").map((item) => item.textContent),
		).toEqual(names);
	});

	it.each(["Editar", "Excluir", "Abrir página"])(
		"dispatches %s once without falling through to row navigation",
		async (name) => {
			const actions = renderClient();
			await openContext(screen.getByText("Ana"));
			fireEvent.click(screen.getByRole("menuitem", { name }));
			const expected =
				name === "Editar"
					? actions.onEdit
					: name === "Excluir"
						? actions.onDelete
						: actions.onOpenPage;
			expect(expected).toHaveBeenCalledExactlyOnceWith(42);
			if (name !== "Abrir página") {
				expect(actions.onOpenPage).not.toHaveBeenCalled();
			}
		},
	);

	it("applies permission filtering equally to context and overflow menus", async () => {
		access.grants.delete("org:clients:update");
		access.grants.delete("org:clients:delete");
		renderClient();
		const menu = await openContext(screen.getByText("Ana"));
		expect(
			screen.getAllByRole("menuitem").map((item) => item.textContent),
		).toEqual(["Abrir página", "Ver resumo"]);
		fireEvent.keyDown(menu, { key: "Escape" });
		await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
		fireEvent.click(screen.getByRole("button", { name: "Ações" }));
		expect(
			screen.getAllByRole("menuitem").map((item) => item.textContent),
		).toEqual(["Abrir página", "Ver resumo"]);
	});

	it("uses deleted-record lifecycle rules for restoration", async () => {
		const { onRestore, onOpenPage } = renderClient(true);
		await openContext(screen.getByText("Ana"));
		expect(
			screen.getAllByRole("menuitem").map((item) => item.textContent),
		).toEqual(["Abrir página", "Ver resumo", "Restaurar"]);
		fireEvent.click(screen.getByRole("menuitem", { name: "Restaurar" }));
		expect(onRestore).toHaveBeenCalledExactlyOnceWith(42);
		expect(onOpenPage).not.toHaveBeenCalled();
	});

	it.each([{ key: "F10", shiftKey: true }, { key: "ContextMenu" }])(
		"supports keyboard invocation and Escape focus restoration: %j",
		async (key) => {
			const { onOpenPage } = renderClient();
			const row = screen.getByText("Ana").closest("tr");
			if (!row) {
				throw new Error("Missing row");
			}
			row.focus();
			fireEvent.keyDown(row, key);
			const menu = await screen.findByRole("menu");
			fireEvent.keyDown(menu, { key: "ArrowDown" });
			fireEvent.keyDown(menu, { key: "Escape" });
			await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
			await waitFor(() => expect(document.activeElement).toBe(row));
			expect(onOpenPage).not.toHaveBeenCalled();
		},
	);

	it("retains left-click, Enter and Space navigation", () => {
		const { onOpenPage } = renderClient();
		const text = screen.getByText("Ana");
		const row = text.closest("tr");
		if (!row) {
			throw new Error("Missing row");
		}
		fireEvent.click(text);
		fireEvent.keyDown(row, { key: "Enter" });
		fireEvent.keyDown(row, { key: " " });
		expect(onOpenPage.mock.calls).toEqual([[42], [42], [42]]);
		expect(screen.queryByRole("menu")).toBeNull();
	});

	it("preserves embedded control interactions", () => {
		const onRowAction = vi.fn();
		render(
			<DataTable
				data={records}
				columns={[
					...columns,
					helper.display({
						id: "controls",
						cell: () => (
							<>
								<a href="#link">Link</a>
								<input aria-label="Campo" />
								<button type="button">Controle</button>
							</>
						),
					}),
				]}
				onRowAction={onRowAction}
				renderRowContextMenu={() => (
					<EntityActions presentation="context" onView={vi.fn()} />
				)}
			/>,
		);
		for (const element of [
			screen.getAllByRole("link", { name: "Link" })[0],
			screen.getAllByRole("textbox")[0],
			screen.getAllByRole("button", { name: "Controle" })[0],
		]) {
			fireEvent.contextMenu(element);
			fireEvent.keyDown(element, { key: "F10", shiftKey: true });
		}
		expect(screen.queryByRole("menu")).toBeNull();
		expect(onRowAction).not.toHaveBeenCalled();
	});

	it("targets original indices after local sorting and pagination", async () => {
		const view = vi.fn();
		render(
			<DataTable
				data={records}
				columns={columns}
				pageSize={1}
				initialSorting={[{ id: "name", desc: true }]}
				renderRowContextMenu={(index) => (
					<EntityActions presentation="context" onView={() => view(index)} />
				)}
			/>,
		);
		await openContext(screen.getByText("Zeca"));
		fireEvent.click(screen.getByRole("menuitem", { name: "Ver resumo" }));
		expect(view).toHaveBeenLastCalledWith(1);
		await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
		fireEvent.click(
			screen.getByRole("button", { name: "Ir para a próxima página" }),
		);
		await openContext(screen.getByText("Bia"));
		fireEvent.click(screen.getByRole("menuitem", { name: "Ver resumo" }));
		expect(view).toHaveBeenLastCalledWith(2);
	});

	it("keeps audit menus read-only and excludes missing callbacks", async () => {
		access.grants.add("org:audit_logs:read");
		const view = vi.fn();
		render(
			<AuditLogTable
				data={{
					total: 1,
					page: 1,
					pageSize: 10,
					data: [
						{
							id: 91,
							occurredAt: "2026-10-26T12:00:00Z",
							occurredAtLabel: "26/10/2026",
							actorName: "Autor",
							actorEmail: null,
							action: "CREATE",
							entityType: "Client",
							entityTypeLabel: "Cliente",
							entityName: "Registro auditado",
							entityId: "42",
							ipAddress: null,
							userAgent: null,
							description: "Registro criado",
						},
					],
				}}
				onView={view}
			/>,
		);
		await openContext(screen.getByText("Registro auditado"));
		expect(
			screen.getAllByRole("menuitem").map((item) => item.textContent),
		).toEqual(["Ver resumo"]);
		fireEvent.click(screen.getByRole("menuitem", { name: "Ver resumo" }));
		expect(view).toHaveBeenCalledExactlyOnceWith(91);
	});

	it("leaves non-opted-in tables without a custom context menu", () => {
		render(<DataTable data={records} columns={columns} />);
		fireEvent.contextMenu(screen.getByText("Ana"));
		expect(screen.queryByRole("menu")).toBeNull();
	});
});
