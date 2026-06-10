import { LandmarkIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";
import type { DashboardSummary } from "../../schemas/model";

interface DashboardCashFlowBalanceCardProps {
	data: NonNullable<DashboardSummary["cashFlow"]>;
}

export function DashboardCashFlowBalanceCard({
	data,
}: DashboardCashFlowBalanceCardProps) {
	const isNegative = data.totalBalance < 0;

	return (
		<Card className="gap-2">
			<CardHeader>
				<div className="flex items-center gap-2">
					<LandmarkIcon className="size-4" />
					<p className="text-sm text-muted-foreground">Fluxo de caixa</p>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-2 pt-0">
				<p
					className={cn(
						"text-2xl font-semibold",
						isNegative && "text-destructive",
					)}
				>
					{data.formattedTotalBalance}
				</p>
				<p className="text-sm text-muted-foreground">Saldo total</p>
			</CardContent>
		</Card>
	);
}
