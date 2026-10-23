// @vitest-environment jsdom
import { createColumnHelper } from "@tanstack/react-table";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { dataTableFeatures } from "@/shared/lib/table";
import { DataTable } from "./data-table";

vi.mock("@/shared/hooks/use-sort", () => ({
	useSort: () => ({
		column: undefined,
		direction: "asc",
		getSortSearch: vi.fn(),
	}),
}));
vi.mock("@/shared/components/ui", () => ({
	Button: ({
		variant: _v,
		size: _s,
		...props
	}: React.ComponentProps<"button"> & { variant?: string; size?: string }) => (
		<button {...props} />
	),
	ScrollArea: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
	Table: "table",
	TableBody: "tbody",
	TableCell: "td",
	TableFooter: "tfoot",
	TableHead: "th",
	TableHeader: "thead",
	TableRow: "tr",
}));
afterEach(cleanup);
const helper = createColumnHelper<typeof dataTableFeatures, { name: string }>();
const columns = [
	helper.accessor("name", {
		header: "Nome",
		enableSorting: false,
		cell: (ctx) => ctx.getValue(),
	}),
];
const data = Array.from({ length: 5 }, (_, i) => ({ name: `Registro ${i}` }));
it("keeps selected page across renders and resets when pageSize changes", () => {
	const { rerender } = render(
		<DataTable data={data} columns={columns} pageSize={2} />,
	);
	fireEvent.click(
		screen.getByRole("button", { name: "Ir para a próxima página" }),
	);
	expect(screen.queryByText("Registro 0")).toBeNull();
	expect(screen.getByText("Registro 2")).toBeTruthy();
	rerender(<DataTable data={data} columns={columns} pageSize={2} />);
	expect(screen.getByText("Registro 2")).toBeTruthy();
	rerender(<DataTable data={data} columns={columns} pageSize={3} />);
	expect(screen.getByText("Registro 0")).toBeTruthy();
});
it("hides navigation for one page and preserves server rows", () => {
	const { rerender } = render(
		<DataTable data={data} columns={columns} pageSize={5} />,
	);
	expect(screen.queryByRole("navigation")).toBeNull();
	rerender(<DataTable data={data} columns={columns} />);
	expect(screen.getByText("Registro 4")).toBeTruthy();
	expect(screen.queryByRole("navigation")).toBeNull();
});
