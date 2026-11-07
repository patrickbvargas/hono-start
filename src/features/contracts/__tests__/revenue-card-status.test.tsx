// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@/shared/components/ui";
import { contractDetailSchema } from "../schemas/model";

vi.mock("../hooks/use-revenue-generation", () => ({
	useRevenueGeneration: () => ({
		canGenerate: false,
		refreshContract: vi.fn(),
		overlay: { details: { render: () => null } },
	}),
}));

import { ContractRevenues } from "../components/details/revenues";

afterEach(cleanup);

function contract(
	hasGeneratedTitles: boolean,
	isFullyPaid: boolean,
	nextDueDate: string | null,
) {
	return contractDetailSchema.parse({
		id: 1,
		processNumber: "DEMO",
		clientId: 1,
		client: "Cliente",
		lawyer: "Advogada",
		legalAreaId: 1,
		legalArea: "Civil",
		legalAreaValue: "CIVIL",
		statusId: 1,
		status: "Ativo",
		statusValue: "ACTIVE",
		feePercentage: 0.3,
		assignmentCount: 1,
		revenueCount: 1,
		assignedEmployeeIds: [1],
		isAssignedToActor: true,
		isActive: true,
		isSoftDeleted: false,
		createdAt: "2026-01-01T00:00:00Z",
		updatedAt: null,
		notes: null,
		allowStatusChange: true,
		assignments: [],
		revenues: [
			{
				id: 1,
				typeId: 1,
				type: "Administrativo",
				typeValue: "ADMINISTRATIVE",
				totalValue: 1000,
				downPaymentValue: null,
				paymentStartDate: "2026-01-01T00:00:00Z",
				totalInstallments: 1,
				paidValue: 0,
				installmentsPaid: 0,
				remainingValue: isFullyPaid ? 0 : 1000,
				isFullyPaid,
				isActive: true,
				isSoftDeleted: false,
				hasGeneratedTitles,
				nextDueDate,
			},
		],
	});
}

describe("revenue financial card status", () => {
	it("explains the balance on keyboard focus of its label", async () => {
		render(
			<TooltipProvider delay={0}>
				<ContractRevenues
					contract={contract(false, false, null)}
					canReadTitles
				/>
			</TooltipProvider>,
		);
		const label = screen.getByRole("button", { name: "Saldo a receber" });
		fireEvent.keyDown(document, { key: "Tab" });
		act(() => label.focus());
		const tooltip = await screen.findByRole("tooltip");
		expect(tooltip.textContent).toBe(
			"Valor dos títulos menos principal já abatido. Sem títulos gerados, saldo zero.",
		);
	});
	it.each([
		[false, true, null, "Pendente"],
		[true, true, null, "Quitado"],
		[true, false, "2020-01-01", "Em atraso"],
	] as const)(
		"shows status in the card header",
		(generated, paid, due, label) => {
			render(
				<ContractRevenues
					contract={contract(generated, paid, due)}
					canReadTitles
				/>,
			);
			expect(
				screen.getByText(label).closest('[data-slot="form-section"]'),
			).toBeTruthy();
		},
	);
	it("hides financial status without title read authority", () => {
		render(
			<ContractRevenues
				contract={contract(true, true, null)}
				canReadTitles={false}
			/>,
		);
		expect(screen.queryByText("Quitado")).toBeNull();
	});
});
