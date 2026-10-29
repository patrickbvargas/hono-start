import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
	Badge,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import type { ContractRevenue } from "../../schemas/model";
import { getInstallmentStatus } from "../../utils/installment-status";

export function RevenueInstallments({ revenue }: { revenue: ContractRevenue }) {
	const today = new Date().toISOString().slice(0, 10);
	return (
		<Accordion defaultValue={[]} className="-mb-3 border-t">
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
					<Table>
						<TableHeader>
							<TableRow>
								{[
									"Parcela",
									"Vencimento",
									"Previsto",
									"Data de recebimento",
									"Recebido",
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
							{revenue.installments.map((row) => {
								const status = getInstallmentStatus(row, today);
								return (
									<TableRow key={row.number}>
										<TableCell>
											{row.number}/{revenue.totalInstallments}
										</TableCell>
										<TableCell className="whitespace-nowrap">
											{formatter.calendarDate(row.dueDate)}
										</TableCell>
										<TableCell className="whitespace-nowrap">
											<SensitiveValue>
												{formatter.currency(row.expectedAmount)}
											</SensitiveValue>
										</TableCell>
										<TableCell>
											{row.paymentDate
												? formatter.calendarDate(row.paymentDate.slice(0, 10))
												: "—"}
										</TableCell>
										<TableCell className="whitespace-nowrap">
											<SensitiveValue>
												{formatter.currency(row.receivedAmount)}
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
														: status === "Recebida"
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
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
