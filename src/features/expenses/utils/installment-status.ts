import type { ExpenseInstallment } from "../schemas/model";

export function getExpenseInstallmentStatus(
	row: ExpenseInstallment,
	today: string,
) {
	if (row.isCancelled) {
		return "Cancelada";
	}
	if (row.remainingAmount <= 0) {
		return "Paga";
	}
	if (row.dueDate < today) {
		return "Em atraso";
	}
	return row.principalAbated > 0 ? "Parcial" : "Pendente";
}
