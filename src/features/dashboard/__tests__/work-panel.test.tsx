// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DashboardWorkPanel } from "../components/work-panel";
import type { DashboardOverdueInstallmentRow } from "../schemas/model";

vi.mock("@tanstack/react-router", () => ({
	Link: ({
		children,
		params,
		"aria-label": label,
	}: {
		children: ReactNode;
		params: { contractId: string };
		"aria-label": string;
	}) => (
		<a href={`/contratos/${params.contractId}?tab=finance`} aria-label={label}>
			{children}
		</a>
	),
}));
afterEach(cleanup);
const rows: DashboardOverdueInstallmentRow[] = Array.from(
	{ length: 4 },
	(_, i) => ({
		contractId: i + 1,
		contractProcessNumber: `PROC-${i + 1}`,
		clientName: `Cliente ${i + 1}`,
		lawyerName: "Advogado",
		legalArea: "Cível",
		revenueType: "Contratual",
		installmentNumber: 1,
		dueDate: "2026-01-01T00:00:00.000Z",
		installmentAmount: 100,
		formattedInstallmentAmount: "R$ 100,00",
		totalValue: 100,
		formattedTotalValue: "R$ 100,00",
	}),
);
describe("dashboard work preview", () => {
	it("caps the preview and opens the contract financial context", () => {
		render(
			<DashboardWorkPanel
				rows={rows}
				scopeLabel="Seus contratos"
				canOpenContracts
			/>,
		);
		expect(screen.getAllByRole("listitem")).toHaveLength(3);
		expect(
			screen
				.getByRole("link", { name: "Abrir financeiro de PROC-1" })
				.getAttribute("href"),
		).toBe("/contratos/1?tab=finance");
		expect(
			screen.getByText(/não representa a quantidade total/),
		).not.toBeNull();
	});
	it("does not offer contract links without contract access", () => {
		render(
			<DashboardWorkPanel
				rows={rows}
				scopeLabel="Seu acesso"
				canOpenContracts={false}
			/>,
		);
		expect(screen.queryAllByRole("link")).toHaveLength(0);
	});
	it("describes an empty scoped result", () => {
		render(
			<DashboardWorkPanel rows={[]} scopeLabel="Seu acesso" canOpenContracts />,
		);
		expect(
			screen.getByText("Nenhuma parcela em atraso nos filtros selecionados."),
		).not.toBeNull();
	});
});
