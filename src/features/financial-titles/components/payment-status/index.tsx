import { Badge } from "@/shared/components/ui";

interface FinancialPaymentStatusProps {
	isFullyPaid: boolean;
	nextDueDate?: string | null;
}

export function FinancialPaymentStatus({
	isFullyPaid,
	nextDueDate,
}: FinancialPaymentStatusProps) {
	const today = new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/Sao_Paulo",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date());
	const isOverdue = !isFullyPaid && Boolean(nextDueDate && nextDueDate < today);
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
			{isFullyPaid ? "Quitado" : isOverdue ? "Em atraso" : "Pendente"}
		</Badge>
	);
}
