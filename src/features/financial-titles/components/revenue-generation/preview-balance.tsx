import { CheckCircle2Icon, TriangleAlertIcon } from "lucide-react";
import { Badge } from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import { titleInputSchema } from "../../schemas/form";
import { getAmountCents, getTitlePlanCents } from "../../utils/payment-plan";

interface PreviewBalanceProps {
	titles: readonly { amount: number }[];
	negotiatedAmount: number;
}

export function PreviewBalance({
	titles,
	negotiatedAmount,
}: PreviewBalanceProps) {
	const valid = titles.every(
		(title) => titleInputSchema.shape.amount.safeParse(title.amount).success,
	);
	const total = valid ? getTitlePlanCents(titles) : null;
	const balanced = total !== null && total === getAmountCents(negotiatedAmount);
	const Icon = balanced ? CheckCircle2Icon : TriangleAlertIcon;
	return (
		<Badge
			role="status"
			aria-atomic="true"
			variant="outline"
			className={`h-auto max-w-full gap-1.5 whitespace-normal py-1 ${
				balanced
					? "border-green-600/20 bg-green-600/10 text-green-800 dark:text-green-300"
					: "border-amber-600/20 bg-amber-500/10 text-amber-800 dark:text-amber-300"
			}`}
		>
			<Icon aria-hidden="true" className="shrink-0" />
			<span>
				{balanced ? "Valores conferem" : "Ajuste necessário"} · Total da prévia:{" "}
				{total === null
					? "Revise os valores"
					: formatter.currency(Number(total) / 100)}{" "}
				· Valor negociado: {formatter.currency(negotiatedAmount)}
				{total !== null && !balanced ? (
					<>
						{" "}
						· Diferença:{" "}
						{formatter.currency(
							Number(getAmountCents(negotiatedAmount) - total) / 100,
						)}
					</>
				) : null}
			</span>
		</Badge>
	);
}
