// @vitest-environment jsdom
import {
	createMemoryHistory,
	createRootRoute,
	createRouter,
	RouterProvider,
} from "@tanstack/react-router";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PendingWorkAction } from "../components/action";
import { PendingWorkDueDate } from "../components/due-date";
import { PendingWorkSeverity } from "../components/severity";
import { PendingWorkSummary } from "../components/summary";
import { usePendingWorkSummary } from "../hooks/use-summary";
import type { PendingWork } from "../schemas/model";
import { pendingWorkSearchSchema } from "../schemas/search";

afterEach(cleanup);
const data = {
	data: [],
	total: 3,
	high: 1,
	medium: 1,
	low: 1,
	contracts: 3,
	page: 3,
	pageSize: 25,
};
function Summary() {
	const { handleSelectSeverity } = usePendingWorkSummary();
	return (
		<PendingWorkSummary data={data} onSelectSeverity={handleSelectSeverity} />
	);
}

describe("pending work presentation", () => {
	it.each(["finance", "team"] as const)(
		"preserves return context when opening %s",
		async (tab) => {
			const item = {
				contractId: 42,
				processNumber: "PROC-42",
				tab,
			} as PendingWork;
			const router = createRouter({
				routeTree: createRootRoute({
					validateSearch: pendingWorkSearchSchema,
					component: () => <PendingWorkAction item={item} />,
				}),
				history: createMemoryHistory({
					initialEntries: [
						"/?page=3&column=client&direction=desc&severity=%5B%22medium%22%5D",
					],
				}),
			});
			await router.load();
			render(<RouterProvider router={router} />);
			const link = await screen.findByRole("link", {
				name: tab === "finance" ? "Abrir financeiro" : "Abrir equipe",
			});
			const destination = new URL(
				link.getAttribute("href") ?? "",
				"http://localhost",
			);
			expect(destination.pathname).toBe("/contratos/42");
			expect(destination.searchParams.get("tab")).toBe(tab);
			expect(
				JSON.parse(destination.searchParams.get("pendingReturnTo") ?? "{}"),
			).toMatchObject({
				page: 3,
				column: "client",
				direction: "desc",
				severity: ["medium"],
			});
		},
	);
	it("filters through cards while preserving the other search dimensions", async () => {
		const router = createRouter({
			routeTree: createRootRoute({
				validateSearch: pendingWorkSearchSchema,
				component: Summary,
			}),
			history: createMemoryHistory({
				initialEntries: ["/?page=3&column=client&direction=desc&query=PROC"],
			}),
		});
		await router.load();
		render(<RouterProvider router={router} />);
		fireEvent.click(
			await screen.findByRole("button", { name: "Filtrar baixa criticidade" }),
		);
		await vi.waitFor(() =>
			expect(router.state.location.search).toMatchObject({
				severity: ["low"],
				query: "PROC",
				column: "client",
				direction: "desc",
				page: 1,
			}),
		);
		fireEvent.click(
			screen.getByRole("button", { name: "Mostrar todas as criticidades" }),
		);
		await vi.waitFor(() =>
			expect(router.state.location.search.severity).toEqual([]),
		);
	});
	it("shows calendar delay separately from the formatted date", () => {
		render(<PendingWorkDueDate date="2026-10-24" overdueDays={1} />);
		expect(screen.getByText("24/10/2026")).toBeDefined();
		expect(screen.getByText("há 1 dia")).toBeDefined();
	});
	it("keeps severity counts and colors distinct", () => {
		render(
			<>
				<PendingWorkSummary data={data} />
				<PendingWorkSeverity severity="high" />
				<PendingWorkSeverity severity="medium" />
			</>,
		);
		expect(
			screen
				.getByText("Contratos afetados")
				.closest('[data-slot="card"]')
				?.querySelector('[data-slot="card-content"]')?.textContent,
		).toBe("3");
		expect(screen.getByText("Alta").className).toContain("text-red");
		expect(screen.getByText("Média").className).toContain("text-amber");
	});
});
