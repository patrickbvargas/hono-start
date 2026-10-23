// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { DataTable } from "@/shared/components/data-table";
import {
	cashFlowDrilldownSeries,
	getColumns as getCashFlowColumns,
	labels,
} from "../components/cash-flow-table/columns";
import { getColumns as getOverdueColumns } from "../components/overdue-table/columns";
import { getColumns } from "../components/remuneration-table/columns";
import type { DashboardCashFlowRow } from "../schemas/model";

afterEach(cleanup);

it("opens collaborator details by ID only when the permitted action is provided", () => {
	const onView = vi.fn();
	const { rerender } = render(
		<DataTable
			data={[person]}
			columns={getColumns(months, undefined, onView)}
			pageSize={10}
		/>,
	);
	fireEvent.click(
		screen.getByRole("button", { name: "Detalhar colaborador Maria" }),
	);
	expect(onView).toHaveBeenCalledWith(5);
	rerender(
		<DataTable data={[person]} columns={getColumns(months)} pageSize={10} />,
	);
	expect(
		screen.queryByRole("button", { name: "Detalhar colaborador Maria" }),
	).toBeNull();
});

vi.mock("@/shared/components/ui", () => ({
	ScrollArea: ({ children }: PropsWithChildren) => <div>{children}</div>,
	Table: "table",
	TableHeader: "thead",
	TableBody: "tbody",
	TableFooter: "tfoot",
	TableRow: "tr",
	TableCell: "td",
	TableHead: "th",
	Button: "button",
}));

const months = [
	{ key: "2026-01", label: "Jan/26" },
	{ key: "2026-02", label: "Fev/26" },
];
const person = {
	employeeId: 5,
	employeeName: "Maria",
	months: { "2026-01": 120, "2026-02": 0 },
	total: 120,
	formattedTotal: "R$ 120,00",
};
it("opens the selected collaborator/month from a keyboard accessible value including zero", () => {
	const onSelect = vi.fn();
	render(
		<DataTable
			data={[person]}
			columns={getColumns(months, onSelect)}
			pageSize={10}
		/>,
	);
	const value = screen.getByRole("button", {
		name: "Detalhar remunerações de Maria em Jan/26",
	});
	expect(value.title).toBe("Ver detalhes: Maria · Jan/26");
	fireEvent.click(value);
	expect(onSelect).toHaveBeenLastCalledWith(person, months[0], value);
	const zero = screen.getByRole("button", {
		name: "Detalhar remunerações de Maria em Fev/26",
	});
	fireEvent.click(zero);
	expect(onSelect).toHaveBeenLastCalledWith(person, months[1], zero);
	const total = screen.getByRole("button", {
		name: "Detalhar total de remunerações de Maria",
	});
	fireEvent.click(total);
	expect(onSelect).toHaveBeenLastCalledWith(person, undefined, total);
});

it("opens every monthly cash-flow amount with its correct column context", () => {
	const onSelect = vi.fn();
	const row: DashboardCashFlowRow = {
		month: "2026-02",
		monthLabel: "Fev/26",
		administrative: 100,
		judicial: 200,
		succumbency: 0,
		entry: 300,
		remuneration: 50,
		expense: 20,
		output: 70,
		balance: 230,
	};
	render(
		<DataTable
			data={[row]}
			columns={getCashFlowColumns(onSelect)}
			pageSize={10}
		/>,
	);
	for (const key of Object.keys(cashFlowDrilldownSeries) as Array<
		keyof typeof cashFlowDrilldownSeries
	>) {
		const button = screen.getByRole("button", {
			name: `Detalhar ${labels[key]} em Fev/26`,
		});
		fireEvent.click(button);
		expect(onSelect).toHaveBeenLastCalledWith(row, key, button);
	}
});

it("links an overdue installment to its stable contract ID only when the action is provided", () => {
	const onView = vi.fn();
	const row = {
		contractId: 42,
		contractProcessNumber: "P1",
		clientName: "Cliente",
		lawyerName: "Advogado",
		legalArea: "Cível",
		revenueType: "Judicial",
		installmentNumber: 1,
		dueDate: "2026-01-01T00:00:00.000Z",
		installmentAmount: 50,
		formattedInstallmentAmount: "R$ 50,00",
		totalValue: 100,
		formattedTotalValue: "R$ 100,00",
	};
	const { rerender } = render(
		<DataTable
			data={[row]}
			columns={getOverdueColumns(onView)}
			pageSize={10}
		/>,
	);
	fireEvent.click(screen.getByRole("button", { name: "Detalhar contrato P1" }));
	expect(onView).toHaveBeenCalledWith(42);
	rerender(
		<DataTable data={[row]} columns={getOverdueColumns()} pageSize={10} />,
	);
	expect(
		screen.queryByRole("button", { name: "Detalhar contrato P1" }),
	).toBeNull();
});
