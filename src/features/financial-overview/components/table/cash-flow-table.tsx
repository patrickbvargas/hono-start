import {
	Badge,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	ScrollArea,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import type { MonthlyCashFlowItem } from "../../schemas/model";

interface CashFlowTableProps {
	rows: MonthlyCashFlowItem[];
}

export function CashFlowTable({ rows }: CashFlowTableProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base font-semibold">
					Demonstrativo Mensal de Caixa
				</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				<ScrollArea className="w-full">
					<Table className="min-w-220">
						<TableHeader>
							<TableRow>
								<TableHead className="w-28 font-medium">Mês</TableHead>
								<TableHead className="w-24">Status</TableHead>
								<TableHead className="text-right">Entradas Real.</TableHead>
								<TableHead className="text-right">Entradas Prev.</TableHead>
								<TableHead className="text-right">Total Entradas</TableHead>
								<TableHead className="text-right">Remunerações</TableHead>
								<TableHead className="text-right">Despesas</TableHead>
								<TableHead className="text-right">Saídas Prev.</TableHead>
								<TableHead className="text-right">Total Saídas</TableHead>
								<TableHead className="text-right font-semibold">
									Saldo do Mês
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{rows.map((row) => (
								<TableRow
									key={row.month}
									className={row.isFuture ? "bg-muted/30 opacity-80" : ""}
								>
									<TableCell className="font-medium">
										{row.monthLabel}
									</TableCell>
									<TableCell>
										{row.isCurrentMonth ? (
											<Badge variant="default" className="text-xs">
												Atual
											</Badge>
										) : row.isFuture ? (
											<Badge
												variant="outline"
												className="text-xs text-muted-foreground"
											>
												Projetado
											</Badge>
										) : (
											<Badge variant="secondary" className="text-xs">
												Realizado
											</Badge>
										)}
									</TableCell>
									<TableCell className="text-right">
										{formatter.currency(row.entryRealized)}
									</TableCell>
									<TableCell className="text-right text-muted-foreground">
										{formatter.currency(row.entryProjected)}
									</TableCell>
									<TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
										{formatter.currency(row.entryTotal)}
									</TableCell>
									<TableCell className="text-right">
										{formatter.currency(row.remunerationPaid)}
									</TableCell>
									<TableCell className="text-right">
										{formatter.currency(row.expensePaid)}
									</TableCell>
									<TableCell className="text-right text-muted-foreground">
										{formatter.currency(row.outputProjected)}
									</TableCell>
									<TableCell className="text-right font-medium text-rose-600 dark:text-rose-400">
										{formatter.currency(row.outputTotal)}
									</TableCell>
									<TableCell
										className={`text-right font-semibold ${
											row.balanceTotal >= 0
												? "text-emerald-600 dark:text-emerald-400"
												: "text-rose-600 dark:text-rose-400"
										}`}
									>
										{formatter.currency(row.balanceTotal)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
