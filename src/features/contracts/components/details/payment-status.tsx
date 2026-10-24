import { Badge } from "@/shared/components/ui";

interface RevenuePaymentStatusProps {
	isFullyPaid: boolean;
	paidValue: number;
	nextDueDate?: string | null;
}
export function RevenuePaymentStatus({
	isFullyPaid,
	paidValue,
	nextDueDate,
}: RevenuePaymentStatusProps) {
	const isOverdue =
		!isFullyPaid &&
		Boolean(nextDueDate && nextDueDate < new Date().toISOString().slice(0, 10));
	return (
		<Badge
			variant="outline"
			className={
				isFullyPaid
					? "border-transparent bg-green-600/10 text-green-700 dark:text-green-400"
					: isOverdue
						? "border-transparent bg-red-600/10 text-red-700 dark:text-red-400"
						: undefined
			}
		>
			{isFullyPaid
				? "Quitado"
				: isOverdue
					? "Em atraso"
					: paidValue > 0
						? "Parcial"
						: "Pendente"}
		</Badge>
	);
}
