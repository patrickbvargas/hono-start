// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { PendingWorkTable } from "../components/table";
import type { PendingWorkPage } from "../schemas/model";

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => navigate,
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
vi.mock("@/shared/components/pagination", () => ({ Pagination: () => null }));
vi.mock("@/shared/hooks/use-sort", () => ({
	useSort: () => ({ getSortSearch: () => ({}) }),
}));
vi.mock("@/shared/components/ui", async (importOriginal) => ({
	...(await importOriginal<typeof import("@/shared/components/ui")>()),
	ScrollArea: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
	Table: "table",
	TableBody: "tbody",
	TableCell: "td",
	TableFooter: "tfoot",
	TableHead: "th",
	TableHeader: "thead",
	TableRow: "tr",
	Button: "button",
	Badge: ({ children }: React.PropsWithChildren) => <span>{children}</span>,
}));
afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});
it.each(["finance", "team"] as const)(
	"preserves finance primary navigation for the %s issue row",
	(tab) => {
		const data: PendingWorkPage = {
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
		};
		const { container } = render(<PendingWorkTable data={data} />);
		const row = container.querySelector("tbody tr");
		if (!row) {
			throw new Error("Missing pending row");
		}
		expect(row.querySelector("a")).toBeNull();
		expect(screen.getByRole("button", { name: "Ações" })).toBeTruthy();
		expect(screen.queryByText("Abrir financeiro")).toBeNull();
		fireEvent.click(screen.getByText("PROC-42"));
		expect(navigate).toHaveBeenCalledWith({
			to: "/contratos/$contractId",
			params: { contractId: "42" },
			search: {
				tab: "finance",
				pendingReturnTo: expect.objectContaining({
					page: 3,
					column: "client",
					direction: "desc",
					query: "PROC",
				}),
			},
		});
	},
);

vi.mock("@/shared/session", () => ({
	useOptionalLoggedUserSession: () => null,
	hasPermission: () => true,
}));
