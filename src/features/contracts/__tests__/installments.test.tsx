// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { RevenueInstallments } from "../components/details/installments";
import { contractRevenueSchema } from "../schemas/model";

afterEach(cleanup);
it("keeps schedule collapsed until requested and allows collapsing again", async () => {
	const revenue = contractRevenueSchema.parse({
		id: 1,
		typeId: 1,
		type: "Mensal",
		typeValue: "MONTHLY",
		totalValue: 100,
		downPaymentValue: null,
		paymentStartDate: "2026-01-01T00:00:00.000Z",
		totalInstallments: 1,
		paidValue: 100,
		installmentsPaid: 1,
		remainingValue: 0,
		isFullyPaid: true,
		isActive: true,
		isSoftDeleted: false,
		installments: [
			{
				number: 1,
				dueDate: "2026-02-01",
				expectedAmount: 100,
				receivedAmount: 100,
				remainingAmount: 0,
				paymentDate: "2026-02-02T00:00:00.000Z",
			},
		],
	});
	render(<RevenueInstallments revenue={revenue} />);
	const trigger = screen.getByRole("button", { name: /Ver parcelas/ });
	expect(trigger.getAttribute("aria-expanded")).toBe("false");
	expect(screen.queryByRole("table")).toBeNull();
	fireEvent.click(trigger);
	expect(await screen.findByRole("table")).toBeTruthy();
	expect(screen.getByText("Recebida")).toBeTruthy();
	expect(trigger.getAttribute("aria-expanded")).toBe("true");
	fireEvent.click(trigger);
	expect(trigger.getAttribute("aria-expanded")).toBe("false");
});
