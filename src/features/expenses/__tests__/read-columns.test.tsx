// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { DataTable } from "@/shared/components/data-table";
import { getExpenseReadColumns } from "../components/table/columns";

vi.mock("@/shared/components/ui", () => ({
	ScrollArea: ({ children }: PropsWithChildren) => <div>{children}</div>,
	Table: "table",
	TableBody: "tbody",
	TableCell: "td",
	TableFooter: "tfoot",
	TableHead: "th",
	TableHeader: "thead",
	TableRow: "tr",
}));
afterEach(cleanup);

it("reuses expense column formatting for a different read model without actions or router context", () => {
	const data = [
		{
			id: "detail:1",
			categoryName: "Telefone",
			occurredAt: "2026-02-03T12:00:00.000Z",
			value: 1234.56,
		},
	];
	const columns = getExpenseReadColumns<(typeof data)[number]>({
		category: (row) => row.categoryName,
		date: (row) => row.occurredAt,
		amount: (row) => row.value,
	});
	const { container } = render(
		<DataTable data={data} columns={columns} getRowId={(row) => row.id} />,
	);
	expect(screen.getByText("Telefone")).toBeTruthy();
	expect(screen.getByText("03/02/2026")).toBeTruthy();
	expect(screen.getByText(/1\.234,56/)).toBeTruthy();
	expect(screen.queryByRole("button")).toBeNull();
	expect(container.querySelector("a")).toBeNull();
});
