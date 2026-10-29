export function getInstallmentStatus(
	row: { remainingAmount: number; receivedAmount: number; dueDate: string },
	today: string,
) {
	if (row.remainingAmount <= 0) {
		return "Recebida";
	}
	if (row.dueDate < today) {
		return "Em atraso";
	}
	return row.receivedAmount > 0 ? "Parcial" : "Pendente";
}
