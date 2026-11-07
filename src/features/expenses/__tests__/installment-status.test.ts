import { describe, expect, it } from "vitest";
import type { ExpenseInstallment } from "../schemas/model";
import { getExpenseInstallmentStatus } from "../utils/installment-status";

const row: ExpenseInstallment = {
	id: 1,
	kind: "INSTALLMENT",
	dueDate: "2026-11-07",
	expectedAmount: 100,
	paidAmount: 0,
	principalAbated: 0,
	remainingAmount: 100,
	paymentDate: null,
	isCancelled: false,
};

describe("expense installment status", () => {
	it.each([
		[{ isCancelled: true, remainingAmount: 0 }, "Cancelada"],
		[{ remainingAmount: 0 }, "Paga"],
		[{ dueDate: "2026-11-06" }, "Em atraso"],
		[{ principalAbated: 10, paidAmount: 0 }, "Parcial"],
		[{}, "Pendente"],
	] as const)("derives %j as %s", (overrides, status) => {
		expect(
			getExpenseInstallmentStatus({ ...row, ...overrides }, "2026-11-07"),
		).toBe(status);
	});
});
