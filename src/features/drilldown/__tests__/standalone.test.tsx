// @vitest-environment jsdom
import {
	QueryClient,
	QueryClientProvider,
	queryOptions,
} from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import {
	type ComponentProps,
	cloneElement,
	type ReactElement,
	type ReactNode,
} from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as z from "zod";
import type { dataTableFeatures } from "@/shared/lib/table";

vi.mock("@/shared/components/ui", () => ({
	TooltipProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
	Tooltip: ({ children }: { children: ReactNode }) => <>{children}</>,
	TooltipContent: ({ children }: { children: ReactNode }) => (
		<div hidden>{children}</div>
	),
	TooltipTrigger: ({
		render,
		children,
	}: {
		render: ReactElement;
		children: ReactNode;
	}) => cloneElement(render, {}, children),
	Dialog: ({ children, open }: { children: ReactNode; open: boolean }) =>
		open ? <div role="dialog">{children}</div> : null,
	DialogContent: ({ children }: { children: ReactNode }) => (
		<div>{children}</div>
	),
	DialogHeader: ({ children }: { children: ReactNode }) => (
		<div>{children}</div>
	),
	DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
	DialogDescription: (props: ComponentProps<"p">) => <p {...props} />,
	Button: ({
		children,
		variant: _variant,
		size,
		...props
	}: ComponentProps<"button"> & { variant?: string; size?: string }) => (
		<button data-size={size} {...props}>
			{children}
		</button>
	),
	Skeleton: (props: ComponentProps<"div">) => (
		<div data-slot="skeleton" {...props} />
	),
	ScrollArea: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	Table: ({ children }: { children: ReactNode }) => <table>{children}</table>,
	TableHeader: ({ children }: { children: ReactNode }) => (
		<thead>{children}</thead>
	),
	TableBody: ({ children }: { children: ReactNode }) => (
		<tbody>{children}</tbody>
	),
	TableFooter: ({ children }: { children: ReactNode }) => (
		<tfoot>{children}</tfoot>
	),
	TableRow: (props: ComponentProps<"tr">) => <tr {...props} />,
	TableCell: ({ children }: { children: ReactNode }) => <td>{children}</td>,
	TableHead: ({ children }: { children: ReactNode }) => <th>{children}</th>,
}));

import { Drilldown } from "../index";

const rowSchema = z.object({ id: z.string(), name: z.string() });
const schema = z.object({
	data: z.array(rowSchema),
	total: z.number(),
});
const c = createColumnHelper<
	typeof dataTableFeatures,
	z.infer<typeof rowSchema>
>();
const listingColumns = [
	c.accessor("name", {
		header: "Nome",
		cell: ({ getValue }) => getValue().toUpperCase(),
		enableSorting: true,
	}),
];

describe("standalone drilldown", () => {
	afterEach(cleanup);
	it("supports non-dashboard card context, reusable columns and local pagination without a router", async () => {
		const read = vi.fn(async (group: string) => ({
			data: [1, 2].map((page) => ({
				id: `${group}:${page}`,
				name: `${group} ${page}`,
			})),
			total: 2,
		}));
		const client = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		const onOpenChange = vi.fn();
		const onRowAction = vi.fn();
		const url = window.location.href;
		const view = (open: boolean, group: string, detailOpen = false) => (
			<QueryClientProvider client={client}>
				<Drilldown
					state={{
						isOpen: open,
						onOpenChange,
						close: () => onOpenChange(false),
					}}
					detailOpen={detailOpen}
					onRowAction={onRowAction}
					rowActionLabel="Ver resumo do registro"
					title="Clientes ativos"
					description="Card da página de clientes"
					context={{ group }}
					filters={{ active: true }}
					pageSize={1}
					columns={listingColumns}
					getRowId={(row) => row.id}
					responseSchema={schema}
					queryOptions={({ context, filters }) =>
						queryOptions({
							queryKey: ["clients", "card", context, filters] as const,
							queryFn: () => read(context.group),
						})
					}
				/>
			</QueryClientProvider>
		);
		const rendered = render(view(false, "grupo A"));
		expect(read).not.toHaveBeenCalled();
		rendered.rerender(view(true, "grupo A"));
		expect(await screen.findByText("GRUPO A 1")).toBeTruthy();
		const firstRow = screen.getByText("GRUPO A 1").closest("tr");
		if (!firstRow) {
			throw new Error("Missing row");
		}
		expect(firstRow.title).toBe("Ver resumo do registro");
		fireEvent.click(firstRow);
		fireEvent.keyDown(firstRow, { key: "Enter" });
		fireEvent.keyDown(firstRow, { key: " " });
		expect(onRowAction).toHaveBeenCalledTimes(3);
		expect(onRowAction).toHaveBeenLastCalledWith({
			id: "grupo A:1",
			name: "grupo A 1",
		});
		expect(
			screen.getByRole("button", { name: "Contexto de Clientes ativos" }),
		).toBeTruthy();
		expect(
			screen
				.getAllByText("Card da página de clientes")
				.some((node) => node.classList.contains("sr-only")),
		).toBe(true);
		expect(screen.getByText("Nome").closest("a")).toBeNull();
		const sortHeader = screen.getByRole("button", { name: "Nome" });
		fireEvent.click(sortHeader);
		fireEvent.click(sortHeader);
		expect(await screen.findByText("GRUPO A 2")).toBeTruthy();
		expect(screen.queryByText("GRUPO A 1")).toBeNull();
		fireEvent.click(sortHeader);
		expect(await screen.findByText("GRUPO A 1")).toBeTruthy();

		expect(read).toHaveBeenCalledTimes(1);
		expect(window.location.href).toBe(url);
		fireEvent.click(
			screen.getByRole("button", { name: "Ir para a próxima página" }),
		);
		expect(await screen.findByText("GRUPO A 2")).toBeTruthy();
		rendered.rerender(view(true, "grupo A", true));
		expect(screen.getByText("GRUPO A 2")).toBeTruthy();
		rendered.rerender(view(true, "grupo A", false));
		expect(screen.getByText("GRUPO A 2")).toBeTruthy();
		expect(window.location.href).toBe(url);
		expect(read).toHaveBeenCalledTimes(1);
		rendered.rerender(view(true, "grupo B"));
		expect(screen.queryByText("GRUPO A 2")).toBeNull();
		expect(await screen.findByText("GRUPO B 1")).toBeTruthy();
		expect(read).toHaveBeenLastCalledWith("grupo B");
		client.clear();
	});
	it("does not render a previous context when its late request completes", async () => {
		let resolveOld: (value: z.infer<typeof schema>) => void = () => {};
		const old = new Promise<z.infer<typeof schema>>((resolve) => {
			resolveOld = resolve;
		});
		const client = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		const view = (group: string) => (
			<QueryClientProvider client={client}>
				<Drilldown
					state={{ isOpen: true, onOpenChange: vi.fn(), close: vi.fn() }}
					title="Clientes"
					description="Contexto"
					context={group}
					filters={{}}
					columns={listingColumns}
					getRowId={(row) => row.id}
					responseSchema={schema}
					queryOptions={({ context }) =>
						queryOptions({
							queryKey: ["clients", context],
							queryFn: () =>
								context === "old"
									? old
									: Promise.resolve({
											data: [{ id: "new", name: "novo" }],
											total: 1,
										}),
						})
					}
				/>
			</QueryClientProvider>
		);
		const rendered = render(view("old"));
		const loading = screen.getByRole("status", { name: "Carregando detalhes" });
		expect(loading.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(1);
		expect(
			loading.querySelector<HTMLElement>('[data-slot="skeleton"]')?.style
				.height,
		).toBe("545px");
		rendered.rerender(view("new"));
		expect(await screen.findByText("NOVO")).toBeTruthy();
		await act(async () =>
			resolveOld({
				data: [{ id: "old", name: "antigo" }],
				total: 1,
			}),
		);
		await waitFor(() => expect(screen.queryByText("ANTIGO")).toBeNull());
		client.clear();
	});
	it("validates responses and clears rows when access fails", async () => {
		const client = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		const read = vi.fn().mockResolvedValue({
			data: [{ id: "1", name: "válido" }],
			total: 1,
		});
		render(
			<QueryClientProvider client={client}>
				<Drilldown
					state={{ isOpen: true, onOpenChange: vi.fn(), close: vi.fn() }}
					title="Clientes"
					description="Contexto"
					context={{}}
					filters={{}}
					columns={listingColumns}
					getRowId={(row) => row.id}
					responseSchema={schema}
					queryOptions={() =>
						queryOptions({ queryKey: ["clients", "restricted"], queryFn: read })
					}
				/>
			</QueryClientProvider>,
		);
		expect(await screen.findByText("VÁLIDO")).toBeTruthy();
		read.mockRejectedValue(new Error("Denied"));
		await act(async () => {
			await client.invalidateQueries({ queryKey: ["clients", "restricted"] });
		});
		expect(await screen.findByRole("alert")).toBeTruthy();
		const retryButton = screen.getByRole("button", {
			name: "Tentar novamente",
		});
		expect(retryButton.getAttribute("type")).toBe("button");
		expect(retryButton.getAttribute("data-size")).toBe("sm");
		expect(screen.queryByText("VÁLIDO")).toBeNull();
		client.clear();
	});
});
