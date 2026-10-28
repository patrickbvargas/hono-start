// @vitest-environment jsdom
import {
	createMemoryHistory,
	createRootRoute,
	createRouter,
	RouterProvider,
} from "@tanstack/react-router";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PendingWorkAction } from "../components/action";
import { PendingWorkContractLink } from "../components/contract-link";
import { PendingWorkDueDate } from "../components/due-date";
import { PendingWorkSeverity } from "../components/severity";
import { PendingWorkSummary } from "../components/summary";
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
					component: () => (
						<>
							<PendingWorkAction item={item} />
							<PendingWorkContractLink item={item} />
						</>
					),
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
			expect(link.querySelector("svg[aria-hidden=true]")).not.toBeNull();
			const contractLink = screen.getByRole("link", { name: "PROC-42" });
			expect(
				contractLink.querySelector("svg[aria-hidden=true]"),
			).not.toBeNull();
			expect(contractLink.className).toMatch(/(?:^|\s)underline(?:\s|$)/);
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
	it("keeps the summary cards hidden from the current UI", () => {
		render(<PendingWorkSummary data={data} />);
		const summary = screen.getByLabelText("Resumo das pendências filtradas");
		expect(summary.hasAttribute("hidden")).toBe(true);
		expect(
			screen.queryByRole("button", { name: "Filtrar baixa criticidade" }),
		).toBeNull();
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
