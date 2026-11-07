import { FinancialPaymentStatus } from "@/features/financial-titles";

interface RevenuePaymentStatusProps {
	isFullyPaid: boolean;
	nextDueDate?: string | null;
}
export function RevenuePaymentStatus({
	isFullyPaid,
	nextDueDate,
}: RevenuePaymentStatusProps) {
	return (
		<FinancialPaymentStatus
			isFullyPaid={isFullyPaid}
			nextDueDate={nextDueDate}
		/>
	);
}
