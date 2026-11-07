// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RevenuePaymentStatus } from "../components/details/payment-status";

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date("2026-10-24T12:00:00Z"));
});
afterEach(() => {
	cleanup();
	vi.useRealTimers();
});
describe("revenue payment status", () => {
	it("keeps titles due today pending in the business timezone", () => {
		vi.setSystemTime(new Date("2026-10-25T01:00:00Z"));
		render(
			<RevenuePaymentStatus isFullyPaid={false} nextDueDate="2026-10-24" />,
		);
		expect(screen.getByText("Pendente")).toBeTruthy();
	});
	it.each([
		{ isFullyPaid: true, paidValue: 6000, label: "Quitado" },
		{ isFullyPaid: false, paidValue: 100, label: "Pendente" },
		{ isFullyPaid: false, paidValue: 0, label: "Pendente" },
		{
			isFullyPaid: false,
			paidValue: 100,
			nextDueDate: "2026-10-23",
			label: "Em atraso",
		},
		{
			isFullyPaid: false,
			paidValue: 0,
			nextDueDate: "2026-10-23",
			label: "Em atraso",
		},
		{
			isFullyPaid: false,
			paidValue: 100,
			nextDueDate: "2026-10-24",
			label: "Pendente",
		},
		{
			isFullyPaid: false,
			paidValue: 0,
			nextDueDate: "2026-10-25",
			label: "Pendente",
		},
		{
			isFullyPaid: true,
			paidValue: 6000,
			nextDueDate: "2026-10-23",
			label: "Quitado",
		},
	])(
		"shows $label from the existing financial state",
		({ label, ...props }) => {
			render(<RevenuePaymentStatus {...props} />);
			const badge = screen.getByText(label);
			expect(badge).toBeTruthy();
			if (label === "Quitado") {
				expect(badge.className).toContain("text-green-700");
			}
			if (label === "Em atraso") {
				expect(badge.className).toContain("text-red-700");
			}
		},
	);
});
