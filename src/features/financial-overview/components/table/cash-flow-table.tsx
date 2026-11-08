import { TableButton } from "@/shared/components/table-button";
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
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import type { MonthlyCashFlowItem } from "../../schemas/model";

export type CashFlowColumnKey =
	| "entryRealized"
	| "entryProjected"
	| "entryTotal"
	| "remunerationPaid"
	| "expensePaid"
	| "outputProjected"
	| "outputTotal"
	| "balanceTotal";

interface CashFlowTableProps {
	rows: MonthlyCashFlowItem[];
	onSelect?: (
		row: MonthlyCashFlowItem,
		column: CashFlowColumnKey,
		trigger: HTMLElement,
	) => void;
}

export function CashFlowTable({ rows, onSelect }: CashFlowTableProps) {
	const renderCell = (
		row: MonthlyCashFlowItem,
		column: CashFlowColumnKey,
		label: string,
		value: number,
		className?: string,
	) => {
		const formatted = (
			<span className={className}>
				<SensitiveValue>{formatter.currency(value)}</SensitiveValue>
			</span>
		);

		if (!onSelect) {
			return formatted;
		}

		return (
			<TableButton
				variant="hover"
				type="button"
				aria-label={`Detalhar ${label} em ${row.monthLabel}`}
				title={`Ver detalhes: ${label} · ${row.monthLabel}`}
				onClick={(event) => onSelect(row, column, event.currentTarget)}
			>
				{formatted}
			</TableButton>
		);
	};

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
										{renderCell(
											row,
											"entryRealized",
											"Entradas Realizadas",
											row.entryRealized,
										)}
									</TableCell>
									<TableCell className="text-right text-muted-foreground">
										{renderCell(
											row,
											"entryProjected",
											"Entradas Previstas",
											row.entryProjected,
										)}
									</TableCell>
									<TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
										{renderCell(
											row,
											"entryTotal",
											"Total de Entradas",
											row.entryTotal,
										)}
									</TableCell>
									<TableCell className="text-right">
										{renderCell(
											row,
											"remunerationPaid",
											"Remunerações",
											row.remunerationPaid,
										)}
									</TableCell>
									<TableCell className="text-right">
										{renderCell(
											row,
											"expensePaid",
											"Despesas",
											row.expensePaid,
										)}
									</TableCell>
									<TableCell className="text-right text-muted-foreground">
										{renderCell(
											row,
											"outputProjected",
											"Saídas Previstas",
											row.outputProjected,
										)}
									</TableCell>
									<TableCell className="text-right font-medium text-rose-600 dark:text-rose-400">
										{renderCell(
											row,
											"outputTotal",
											"Total de Saídas",
											row.outputTotal,
										)}
									</TableCell>
									<TableCell
										className={`text-right font-semibold ${
											row.balanceTotal >= 0
												? "text-emerald-600 dark:text-emerald-400"
												: "text-rose-600 dark:text-rose-400"
										}`}
									>
										{renderCell(
											row,
											"balanceTotal",
											"Saldo do Mês",
											row.balanceTotal,
										)}
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
