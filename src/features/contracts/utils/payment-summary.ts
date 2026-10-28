import { formatter } from "@/shared/lib/formatter";

interface PaymentSummaryInput {
	totalValue: number;
	downPaymentValue: number | null;
	totalInstallments: number;
}

export function getPaymentSummary(
	{ totalValue, downPaymentValue, totalInstallments }: PaymentSummaryInput,
	{ includeEntry = true }: { includeEntry?: boolean } = {},
) {
	const entry = downPaymentValue ?? 0;
	if (
		!Number.isFinite(totalValue) ||
		totalValue <= 0 ||
		!Number.isFinite(entry) ||
		entry < 0 ||
		entry > totalValue ||
		!Number.isSafeInteger(totalInstallments) ||
		totalInstallments < 1
	) {
		return "Pagamento pendente";
	}
	const principal = Math.round(totalValue * 100) - Math.round(entry * 100);
	if (principal === 0) {
		return includeEntry
			? `Entrada de ${formatter.currency(entry)} (pagamento integral)`
			: "Pagamento integral na entrada";
	}
	const installments = `${totalInstallments}x de ${formatter.currency(principal / 100 / totalInstallments)}`;
	return entry > 0 && includeEntry
		? `Entrada de ${formatter.currency(entry)} + ${installments}`
		: installments;
}
