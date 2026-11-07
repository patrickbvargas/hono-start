import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
	Badge,
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
import type { ExpenseInstallment } from "../../schemas/model";
import { getExpenseInstallmentStatus } from "../../utils/installment-status";

interface ExpenseInstallmentsProps {
	installments: ExpenseInstallment[];
}

export function ExpenseInstallments({
	installments,
}: ExpenseInstallmentsProps) {
	const today = new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/Sao_Paulo",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date());
	const kinds = {
		DOWN_PAYMENT: "Entrada",
		INSTALLMENT: "Parcela",
		EXTRA: "Extra",
	};
	return (
		<Accordion defaultValue={[]} className="border-t">
			<AccordionItem value="installments">
				<AccordionTrigger className="group">
					<span>
						<span className="group-aria-expanded:hidden">Ver parcelas</span>
						<span className="hidden group-aria-expanded:inline">
							Ocultar parcelas
						</span>
					</span>
				</AccordionTrigger>
				<AccordionContent>
					<ScrollArea className="w-full min-w-0">
						<Table aria-label="Parcelas da despesa">
							<TableHeader>
								<TableRow>
									{[
										"Parcela",
										"Tipo",
										"Vencimento",
										"Previsto",
										"Data de pagamento",
										"Pago",
										"Saldo",
										"Status",
									].map((label) => (
										<TableHead key={label} className="whitespace-nowrap">
											{label}
										</TableHead>
									))}
								</TableRow>
							</TableHeader>
							<TableBody>
								{installments.map((row, index) => {
									const status = getExpenseInstallmentStatus(row, today);
									return (
										<TableRow key={row.id}>
											<TableCell>
												{index + 1}/{installments.length}
											</TableCell>
											<TableCell>{kinds[row.kind]}</TableCell>
											<TableCell className="whitespace-nowrap">
												{formatter.calendarDate(row.dueDate)}
											</TableCell>
											<TableCell className="whitespace-nowrap">
												<SensitiveValue>
													{formatter.currency(row.expectedAmount)}
												</SensitiveValue>
											</TableCell>
											<TableCell className="whitespace-nowrap">
												{row.paymentDate
													? formatter.calendarDate(row.paymentDate)
													: "—"}
											</TableCell>
											<TableCell className="whitespace-nowrap">
												<SensitiveValue>
													{formatter.currency(row.paidAmount)}
												</SensitiveValue>
											</TableCell>
											<TableCell className="whitespace-nowrap">
												<SensitiveValue>
													{formatter.currency(row.remainingAmount)}
												</SensitiveValue>
											</TableCell>
											<TableCell>
												<Badge
													variant="outline"
													className={
														status === "Em atraso"
															? "border-transparent bg-red-600/10 text-red-700 dark:text-red-400"
															: status === "Paga"
																? "border-transparent bg-green-600/10 text-green-700 dark:text-green-400"
																: undefined
													}
												>
													{status}
												</Badge>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</ScrollArea>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
