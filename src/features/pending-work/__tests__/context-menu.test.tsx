// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { PendingWorkList } from "../components/list";
import { PendingWorkTable } from "../components/table";
import type { PendingWorkPage } from "../schemas/model";

const mocks = vi.hoisted(() => ({ navigate: vi.fn(), allowed: true }));
vi.mock("@tanstack/react-router", async (original) => ({
	...(await original<typeof import("@tanstack/react-router")>()),
	useNavigate: () => mocks.navigate,
	useSearch: () => ({
		page: 3,
		column: "client",
		direction: "desc",
		query: "PROC",
	}),
	Link: ({ children }: React.PropsWithChildren) => (
		<a href="#sort">{children}</a>
	),
}));
vi.mock("@/shared/components/navigation-link", () => ({
	NavigationLink: ({ children }: React.PropsWithChildren) => (
		<a href="#contract">{children}</a>
	),
}));
vi.mock("@/shared/components/pagination", () => ({ Pagination: () => null }));
vi.mock("@/shared/hooks/use-sort", () => ({
	useSort: () => ({ getSortSearch: () => ({}) }),
}));
vi.mock("@/shared/session", () => ({
	useOptionalLoggedUserSession: () => null,
	useLoggedUserSession: () => null,
	hasPermission: () => mocks.allowed,
}));
vi.mock("@/features/related-records", async (original) => ({
	...(await original<typeof import("@/features/related-records")>()),
	RelatedRecordDetails: ({
		id,
		state,
	}: {
		id: number;
		state: { close: () => void };
	}) => (
		<section aria-label={`Resumo ${id}`}>
			<button onClick={state.close}>Voltar</button>
		</section>
	),
}));
afterEach(() => {
	cleanup();
	mocks.navigate.mockClear();
	mocks.allowed = true;
});
const data = (tab: "finance" | "team"): PendingWorkPage => ({
	data: [
		{
			id: "issue-42",
			contractId: 42,
			processNumber: "PROC-42",
			clientId: 7,
			client: "Cliente",
			title: "Pendência",
			severity: "low",
			type: "settled-active",
			dueDate: null,
			overdueDays: null,
			overdueAmount: null,
			remainingAmount: 0,
			tab,
		},
	],
	total: 1,
	high: 0,
	medium: 0,
	low: 1,
	contracts: 1,
	page: 3,
	pageSize: 25,
});

it.each(["finance", "team"] as const)(
	"context menu opens %s with pending return search",
	async (tab) => {
		render(<PendingWorkTable data={data(tab)} />);
		fireEvent.contextMenu(screen.getByText("PROC-42"), { button: 2 });
		const name = "Abrir página";
		fireEvent.click(await screen.findByRole("menuitem", { name }));
		expect(mocks.navigate).toHaveBeenCalledExactlyOnceWith({
			to: "/contratos/$contractId",
			params: { contractId: "42" },
			search: {
				tab,
				pendingReturnTo: expect.objectContaining({
					page: 3,
					query: "PROC",
					column: "client",
					direction: "desc",
				}),
			},
		});
	},
);

it.each(["table", "card"] as const)(
	"opens persistent summary from %s overflow without navigating",
	async (surface) => {
		const Component = surface === "table" ? PendingWorkTable : PendingWorkList;
		render(<Component data={data("finance")} />);
		fireEvent.click(screen.getByRole("button", { name: "Ações" }));
		fireEvent.click(
			await screen.findByRole("menuitem", { name: "Ver resumo" }),
		);
		expect(await screen.findByLabelText("Resumo 42")).toBeTruthy();
		expect(mocks.navigate).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
		expect(screen.queryByLabelText("Resumo 42")).toBeNull();
		expect(screen.getByText("PROC-42")).toBeTruthy();
	},
);

it("does not expose actions without contract read grants", () => {
	mocks.allowed = false;
	render(<PendingWorkTable data={data("finance")} />);
	expect(screen.queryByRole("button", { name: "Ações" })).toBeNull();
});

it("supports pending row keyboard menus and restores focus on Escape", async () => {
	render(<PendingWorkTable data={data("finance")} />);
	const row = screen.getByText("PROC-42").closest("tr");
	if (!row) {
		throw new Error("Missing row");
	}
	row.focus();
	fireEvent.keyDown(row, { key: "ContextMenu" });
	const menu = await screen.findByRole("menu");
	fireEvent.keyDown(menu, { key: "Escape" });
	await waitFor(() => expect(document.activeElement).toBe(row));
});
