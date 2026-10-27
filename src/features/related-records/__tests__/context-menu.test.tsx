// @vitest-environment jsdom

import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { RelatedRecordLink } from "../components/link";

const mocks = vi.hoisted(() => ({ openPage: vi.fn(), allowed: true }));
vi.mock("../hooks/use-record-page", () => ({
	useRecordPage: () => ({ openPage: mocks.openPage }),
}));
vi.mock("@/shared/session", () => ({
	useOptionalLoggedUserSession: () => null,
	hasPermission: () => mocks.allowed,
}));
vi.mock("../components/details", () => ({
	RelatedRecordDetails: ({ id }: { id: number }) => <p>Resumo {id}</p>,
}));
afterEach(cleanup);
beforeEach(() => {
	mocks.allowed = true;
	mocks.openPage.mockClear();
});

it.each(["default", "table"] as const)(
	"offers both actions on %s links without opening summary",
	async (variant) => {
		render(
			<RelatedRecordLink kind="client" id={42} variant={variant}>
				Ana
			</RelatedRecordLink>,
		);
		const link = screen.getByRole("button", { name: "Ana" });
		fireEvent.contextMenu(link, { button: 2, clientX: 120, clientY: 160 });
		await screen.findByRole("menu");
		expect(
			screen.getAllByRole("menuitem").map((item) => item.textContent),
		).toEqual(["Abrir página", "Ver resumo"]);
		expect(screen.queryByText("Resumo 42")).toBeNull();
		fireEvent.click(screen.getByRole("menuitem", { name: "Abrir página" }));
		expect(mocks.openPage).toHaveBeenCalledOnce();
		expect(screen.queryByText("Resumo 42")).toBeNull();
	},
);

it("opens summary from menu without navigating", async () => {
	render(
		<RelatedRecordLink kind="client" id={42}>
			Ana
		</RelatedRecordLink>,
	);
	fireEvent.contextMenu(screen.getByRole("button", { name: "Ana" }), {
		button: 2,
	});
	fireEvent.click(await screen.findByRole("menuitem", { name: "Ver resumo" }));
	expect(await screen.findByText("Resumo 42")).toBeTruthy();
	expect(mocks.openPage).not.toHaveBeenCalled();
});

it.each([{ key: "F10", shiftKey: true }, { key: "ContextMenu" }])(
	"supports keyboard menu and restores focus on Escape: %o",
	async (event) => {
		render(
			<RelatedRecordLink kind="client" id={42}>
				Ana
			</RelatedRecordLink>,
		);
		const link = screen.getByRole("button", { name: "Ana" });
		link.focus();
		fireEvent.keyDown(link, event);
		const menu = await screen.findByRole("menu");
		fireEvent.keyDown(menu, { key: "Escape" });
		await waitFor(() => expect(document.activeElement).toBe(link));
		expect(mocks.openPage).not.toHaveBeenCalled();
	},
);

it("hides actions without the read grant", async () => {
	mocks.allowed = false;
	render(
		<RelatedRecordLink kind="client" id={42}>
			Ana
		</RelatedRecordLink>,
	);
	fireEvent.contextMenu(screen.getByRole("button", { name: "Ana" }), {
		button: 2,
	});
	await screen.findByRole("menu");
	expect(screen.queryAllByRole("menuitem")).toHaveLength(0);
});

it("keeps a related link menu independent from the table row menu", async () => {
	const { DataTable } = await import("@/shared/components/data-table");
	const rowAction = vi.fn();
	render(
		<DataTable
			data={[{ id: 42 }]}
			columns={[
				{
					id: "name",
					header: "Cliente",
					cell: () => (
						<RelatedRecordLink kind="client" id={42} variant="table">
							Ana
						</RelatedRecordLink>
					),
				},
			]}
			onRowAction={rowAction}
			renderRowContextMenu={() => <div role="menuitem">Ação da linha</div>}
		/>,
	);
	fireEvent.contextMenu(screen.getByRole("button", { name: "Ana" }), {
		button: 2,
	});
	expect(
		await screen.findByRole("menuitem", { name: "Abrir página" }),
	).toBeTruthy();
	expect(screen.queryByRole("menuitem", { name: "Ação da linha" })).toBeNull();
	expect(rowAction).not.toHaveBeenCalled();
});

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
vi.mock("@tanstack/react-router", async (importOriginal) => ({
	...(await importOriginal<typeof import("@tanstack/react-router")>()),
	Link: ({ children }: React.PropsWithChildren) => (
		<a href="#sort">{children}</a>
	),
}));

it("supports page as primary action while retaining summary in the menu", async () => {
	render(
		<RelatedRecordLink kind="client" id={42} primaryAction="page">
			Ana
		</RelatedRecordLink>,
	);
	const link = screen.getByRole("button", { name: "Ana" });
	expect(link.title).toBe("Abrir página de Ana");
	expect(link.hasAttribute("aria-haspopup")).toBe(false);
	expect(link.hasAttribute("aria-expanded")).toBe(false);
	fireEvent.click(link);
	expect(mocks.openPage).toHaveBeenCalledOnce();
	expect(screen.queryByText("Resumo 42")).toBeNull();
	fireEvent.contextMenu(link, { button: 2 });
	fireEvent.click(await screen.findByRole("menuitem", { name: "Ver resumo" }));
	expect(await screen.findByText("Resumo 42")).toBeTruthy();
	expect(mocks.openPage).toHaveBeenCalledOnce();
});
