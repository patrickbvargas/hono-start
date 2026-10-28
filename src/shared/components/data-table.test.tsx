// @vitest-environment jsdom
import { createColumnHelper } from "@tanstack/react-table";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { dataTableFeatures } from "@/shared/lib/table";
import { DataTable } from "./data-table";

vi.mock("@tanstack/react-router", () => ({
	Link: ({
		children,
		search,
	}: React.PropsWithChildren<{ search: unknown }>) => (
		<a href={`?${JSON.stringify(search)}`}>{children}</a>
	),
}));

vi.mock("@/shared/hooks/use-sort", () => ({
	useSort: () => ({
		column: undefined,
		direction: "asc",
		getSortSearch: (column: string) => ({ sort: column, direction: "asc" }),
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

it("applies initial descending sorting before pagination and allows changing it", () => {
	render(
		<DataTable
			data={[
				{ name: "2026-01-01" },
				{ name: "2026-03-01" },
				{ name: "2026-02-01" },
			]}
			columns={[helper.accessor("name", { header: "Data" })]}
			pageSize={2}
			initialSorting={[{ id: "name", desc: true }]}
		/>,
	);
	expect(screen.getAllByRole("cell").map((cell) => cell.textContent)).toEqual([
		"2026-03-01",
		"2026-02-01",
	]);
	fireEvent.click(screen.getByRole("button", { name: "Data" }));
	expect(screen.getByText("2026-01-01")).toBeTruthy();
});

it("keeps server sorting in route links without reordering supplied rows", () => {
	render(
		<DataTable
			data={[{ name: "C" }, { name: "A" }]}
			columns={[helper.accessor("name", { header: "Nome" })]}
		/>,
	);
	expect(
		screen.getByRole("link", { name: "Nome" }).getAttribute("href"),
	).toContain('"sort":"name"');
	expect(screen.getAllByRole("cell").map((cell) => cell.textContent)).toEqual([
		"C",
		"A",
	]);
});

it("sorts the complete dataset locally before pagination and preserves original row indexes", () => {
	const onRowAction = vi.fn();
	const sortable = [
		helper.accessor("name", { header: "Nome", sortDescFirst: false }),
	];
	render(
		<DataTable
			data={[{ name: "C" }, { name: "A" }, { name: "B" }]}
			columns={sortable}
			pageSize={2}
			onRowAction={onRowAction}
		/>,
	);
	const header = screen.getByRole("button", { name: "Nome" });
	fireEvent.click(header);
	expect(screen.getAllByRole("cell").map((cell) => cell.textContent)).toEqual([
		"A",
		"B",
	]);
	expect(screen.getByRole("columnheader").getAttribute("aria-sort")).toBe(
		"ascending",
	);
	fireEvent.click(screen.getByText("A"));
	expect(onRowAction).toHaveBeenCalledWith(1);
	fireEvent.click(header);
	expect(screen.getAllByRole("cell").map((cell) => cell.textContent)).toEqual([
		"C",
		"B",
	]);
	fireEvent.click(header);
	expect(screen.getAllByRole("cell").map((cell) => cell.textContent)).toEqual([
		"C",
		"A",
	]);
});

it("sorts numeric accessor values rather than their formatted labels and respects disabled columns", () => {
	const numberHelper = createColumnHelper<
		typeof dataTableFeatures,
		{ value: number }
	>();
	render(
		<DataTable
			data={[{ value: 100 }, { value: 2 }, { value: 30 }]}
			columns={[
				numberHelper.accessor("value", {
					header: "Valor",
					sortDescFirst: false,
					cell: (ctx) => `R$ ${ctx.getValue()}`,
				}),
				numberHelper.display({
					id: "fixed",
					header: "Fixo",
					enableSorting: false,
				}),
			]}
			pageSize={2}
		/>,
	);
	fireEvent.click(screen.getByRole("button", { name: "Valor" }));
	expect(screen.getByText("R$ 2")).toBeTruthy();
	expect(screen.getByText("R$ 30")).toBeTruthy();
	expect(screen.queryByText("R$ 100")).toBeNull();
	expect(screen.queryByRole("button", { name: "Fixo" })).toBeNull();
});
const helper = createColumnHelper<typeof dataTableFeatures, { name: string }>();
const columns = [
	helper.accessor("name", {
		header: "Nome",
		enableSorting: false,
		cell: (ctx) => ctx.getValue(),
	}),
];
const data = Array.from({ length: 5 }, (_, i) => ({ name: `Registro ${i}` }));
it("keeps headers and renders an actionable empty slot instead of the fallback", () => {
	const clear = vi.fn();
	const { rerender } = render(
		<DataTable
			data={[]}
			columns={columns}
			emptyState={
				<button type="button" onClick={clear}>
					Limpar filtros
				</button>
			}
		/>,
	);
	expect(screen.getByRole("columnheader", { name: "Nome" })).toBeTruthy();
	fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
	expect(clear).toHaveBeenCalledOnce();
	expect(screen.queryByText("Nenhum registro encontrado.")).toBeNull();
	rerender(
		<DataTable
			data={[]}
			columns={columns}
			emptyMessage="Nenhuma alteração registrada."
		/>,
	);
	expect(screen.getByText("Nenhuma alteração registrada.")).toBeTruthy();
	rerender(
		<DataTable
			data={data}
			columns={columns}
			emptyState={<button type="button">Limpar filtros</button>}
		/>,
	);
	expect(screen.queryByRole("button", { name: "Limpar filtros" })).toBeNull();
});
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
it("opens rows by click or keyboard and ignores nested options", () => {
	const onRowAction = vi.fn();
	const onOptions = vi.fn();
	const { container } = render(
		<DataTable
			data={[{ name: "Registro" }]}
			columns={[
				helper.accessor("name", { header: "Nome" }),
				helper.display({
					id: "options",
					cell: () => (
						<button type="button" onClick={onOptions}>
							<span>Opções</span>
						</button>
					),
				}),
			]}
			onRowAction={onRowAction}
		/>,
	);
	const row = container.querySelector("tbody tr");
	if (!row) {
		throw new Error("Missing record row");
	}
	expect(row.getAttribute("tabindex")).toBe("0");
	expect(row.getAttribute("title")).toBe("Abrir página do registro");
	fireEvent.click(screen.getByText("Registro"));
	expect(onRowAction).toHaveBeenCalledWith(0);
	fireEvent.click(screen.getByText("Opções"));
	fireEvent.keyDown(screen.getByRole("button", { name: "Opções" }), {
		key: "Enter",
	});
	expect(onOptions).toHaveBeenCalledOnce();
	expect(onRowAction).toHaveBeenCalledTimes(1);
	fireEvent.keyDown(row, { key: "Enter" });
	fireEvent.keyDown(row, { key: " " });
	expect(onRowAction).toHaveBeenCalledTimes(3);
});
