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
	it.each([
		{ isFullyPaid: true, paidValue: 6000, label: "Quitado" },
		{ isFullyPaid: false, paidValue: 100, label: "Parcial" },
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
			label: "Parcial",
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
