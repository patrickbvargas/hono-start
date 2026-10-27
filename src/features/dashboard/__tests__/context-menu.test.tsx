// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { DashboardDrilldownModal } from "../components/drilldown/modal";
import { dashboardSearchSchema } from "../schemas/search";

const mocks = vi.hoisted(() => ({
	openPage: vi.fn(),
	allowed: true,
	rows: [
		{
			id: "fee:99",
			record: { kind: "fee", id: 99 },
			date: "2026-10-26T12:00:00.000Z",
			kind: "Recebimento",
			description: "Recebimento teste",
			amount: 100,
		},
		{
			id: "planned:7:1",
			record: { kind: "contract", id: 7 },
			date: "2026-10-25T12:00:00.000Z",
			kind: "Parcela",
			description: "Parcela teste",
			amount: 100,
		},
		{
			id: "remuneration:12",
			record: { kind: "remuneration", id: 12 },
			date: "2026-10-24T12:00:00.000Z",
			kind: "Remuneração",
			description: "Remuneração teste",
			amount: 100,
		},
		{
			id: "expense:4",
			record: { kind: "expense", id: 4 },
			date: "2026-10-23T12:00:00.000Z",
			kind: "Despesa",
			description: "Despesa teste",
			amount: 100,
		},
	],
}));
vi.mock("@tanstack/react-query", async (original) => ({
	...(await original<typeof import("@tanstack/react-query")>()),
	useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));
vi.mock("../api/queries", () => ({
	dashboardKeys: { all: ["dashboard"] },
	getDashboardDrilldownQueryOptions: vi.fn(),
}));
vi.mock("@/features/drilldown/hooks/use-data", () => ({
	useDrilldownData: () => ({
		query: {
			data: {
				data: mocks.rows,
				total: 4,
				amount: 400,
				entries: 400,
				deductions: 0,
			},
			isFetching: false,
			isError: false,
		},
	}),
}));
vi.mock("@/features/related-records/hooks/use-record-page", () => ({
	useRecordPage: (kind: string, id: number) => ({
		openPage: () => mocks.openPage(kind, id),
	}),
}));
vi.mock("@/shared/session", () => ({
	useOptionalLoggedUserSession: () => null,
	hasPermission: () => mocks.allowed,
}));
vi.mock("../components/drilldown/summary", () => ({
	DashboardRecordSummary: ({
		record,
		state,
	}: {
		record: { kind: string; id: number };
		state: { close: () => void };
	}) => (
		<section aria-label={`Resumo ${record.kind} ${record.id}`}>
			<button onClick={state.close}>Voltar</button>
		</section>
	),
}));
afterEach(() => {
	cleanup();
	mocks.openPage.mockClear();
	mocks.allowed = true;
});

function mount() {
	return render(
		<DashboardDrilldownModal
			target={{
				selection: { kind: "metric", value: "revenue" },
				title: "Recebimentos",
				expectedAmount: 400,
			}}
			search={dashboardSearchSchema.parse({})}
			referenceAt="2026-10-26T12:00:00.000Z"
			state={{ isOpen: true, close: vi.fn(), onOpenChange: vi.fn() }}
			returnFocus={null}
		/>,
	);
}

it.each(mocks.rows)(
	"direct menu access uses persisted target for $id",
	async (row) => {
		mount();
		fireEvent.contextMenu(screen.getByText(row.description), { button: 2 });
		fireEvent.click(
			await screen.findByRole("menuitem", { name: "Abrir página" }),
		);
		expect(mocks.openPage).toHaveBeenCalledExactlyOnceWith(
			row.record.kind,
			row.record.id,
		);
		expect(
			screen.queryByLabelText(`Resumo ${row.record.kind} ${row.record.id}`),
		).toBeNull();
	},
);

it("overflow opens summary and retains analysis on dismissal", async () => {
	mount();
	fireEvent.click(screen.getAllByRole("button", { name: "Ações" })[0]);
	fireEvent.click(await screen.findByRole("menuitem", { name: "Ver resumo" }));
	expect(await screen.findByLabelText("Resumo fee 99")).toBeTruthy();
	fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
	expect(screen.queryByLabelText("Resumo fee 99")).toBeNull();
	expect(screen.getByText("Recebimento teste")).toBeTruthy();
	expect(mocks.openPage).not.toHaveBeenCalled();
});

it("keyboard context menu restores row focus", async () => {
	mount();
	const row = screen.getByText("Recebimento teste").closest("tr");
	if (!row) {
		throw new Error("Missing row");
	}
	row.focus();
	fireEvent.keyDown(row, { key: "F10", shiftKey: true });
	fireEvent.keyDown(await screen.findByRole("menu"), { key: "Escape" });
	await waitFor(() => expect(document.activeElement).toBe(row));
});

it("hides overflow without read grants", () => {
	mocks.allowed = false;
	mount();
	expect(screen.queryByRole("button", { name: "Ações" })).toBeNull();
});

it("retains local pagination when a menu summary is opened and closed", async () => {
	const originalCount = mocks.rows.length;
	try {
		mocks.rows.push(
			...Array.from({ length: 9 }, (_, index) => ({
				...mocks.rows[0],
				id: `extra:${index}`,
				record: { kind: "fee", id: 200 + index },
				date: "2026-10-01T12:00:00.000Z",
				description: `Extra ${index}`,
			})),
		);
		mount();
		fireEvent.click(
			screen.getByRole("button", { name: "Ir para a próxima página" }),
		);
		const reference = screen.getByText("Extra 6");
		fireEvent.contextMenu(reference, { button: 2 });
		fireEvent.click(
			await screen.findByRole("menuitem", { name: "Ver resumo" }),
		);
		expect(await screen.findByLabelText("Resumo fee 206")).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
		expect(screen.getByText("Extra 6")).toBeTruthy();
		expect(screen.queryByText("Recebimento teste")).toBeNull();
	} finally {
		mocks.rows.splice(originalCount);
	}
});

it("retains primary row activation for summaries", async () => {
	mount();
	fireEvent.click(screen.getByText("Recebimento teste"));
	expect(await screen.findByLabelText("Resumo fee 99")).toBeTruthy();
	expect(mocks.openPage).not.toHaveBeenCalled();
});
