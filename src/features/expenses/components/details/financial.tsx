import { Suspense } from "react";
import {
	ExpenseGenerationForm,
	FinancialPaymentStatus,
} from "@/features/financial-titles";
import { EntityDetail } from "@/shared/components/entity-detail";
import { FormSection } from "@/shared/components/form-section";
import { Button, Skeleton } from "@/shared/components/ui";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import { useExpenseFinancial } from "../../hooks/use-data";
import { useExpenseGeneration } from "../../hooks/use-generation";
import type { ExpenseDetail } from "../../schemas/model";
import { ExpenseInstallments } from "./installments";

interface ExpenseFinancialProps {
	expense: ExpenseDetail;
}

export function ExpenseFinancial({ expense }: ExpenseFinancialProps) {
	const { overlay, canGenerate, canReadTitles, refreshExpense } =
		useExpenseGeneration(expense);
	return (
		<FormSection
			title="Despesa"
			action={
				canReadTitles ? (
					<Suspense fallback={<Skeleton className="h-5 w-16" />}>
						<ExpenseFinancialStatus id={expense.id} />
					</Suspense>
				) : undefined
			}
		>
			<EntityDetail.Fields
				columns={2}
				items={[
					{
						term: "Valor negociado",
						definition: (
							<SensitiveValue>
								{formatter.currency(expense.negotiatedAmount)}
							</SensitiveValue>
						),
					},
					{
						term: "Acerto financeiro",
						definition: expense.hasGeneratedTitles
							? "Títulos gerados"
							: "Aguardando geração de títulos",
					},
				]}
			/>
			{canReadTitles && (
				<Suspense fallback={<Skeleton className="h-20 w-full" />}>
					<ExpenseFinancialSummary id={expense.id} />
				</Suspense>
			)}
			{canGenerate && (
				<Button size="sm" onClick={() => overlay.details.open(expense.id)}>
					Gerar parcelas
				</Button>
			)}
			{overlay.details.render((id, state) => (
				<ExpenseGenerationForm
					key={id}
					expenseId={id}
					negotiatedAmount={expense.negotiatedAmount}
					state={state}
					onSuccess={async () => {
						await refreshExpense();
						state.close();
					}}
				/>
			))}
		</FormSection>
	);
}

function ExpenseFinancialStatus({ id }: { id: number }) {
	const { financial } = useExpenseFinancial(id);
	const active = financial.installments.filter((row) => !row.isCancelled);
	const nextDueDate =
		active
			.filter((row) => row.remainingAmount > 0)
			.map((row) => row.dueDate)
			.sort()[0] ?? null;
	return (
		<FinancialPaymentStatus
			isFullyPaid={active.length > 0 && financial.remainingAmount === 0}
			nextDueDate={nextDueDate}
		/>
	);
}

function ExpenseFinancialSummary({ id }: { id: number }) {
	const { financial } = useExpenseFinancial(id);
	return (
		<>
			<EntityDetail.Fields
				columns={2}
				items={[
					{
						term: "Pago",
						definition: (
							<SensitiveValue>
								{formatter.currency(financial.paidAmount)}
							</SensitiveValue>
						),
					},
					{
						term: "Saldo a pagar",
						tooltip:
							"Valor dos títulos menos principal já abatido. Sem títulos gerados, saldo zero.",
						definition: (
							<SensitiveValue>
								{formatter.currency(financial.remainingAmount)}
							</SensitiveValue>
						),
					},
				]}
			/>
			{financial.installments.length > 0 && (
				<ExpenseInstallments installments={financial.installments} />
			)}
		</>
	);
}
