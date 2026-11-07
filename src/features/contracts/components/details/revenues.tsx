import { RevenueGenerationForm } from "@/features/financial-titles";
import { EntityDetail } from "@/shared/components/entity-detail";
import { FormSection } from "@/shared/components/form-section";
import { Button } from "@/shared/components/ui";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import { useRevenueGeneration } from "../../hooks/use-revenue-generation";
import type { ContractDetail } from "../../schemas/model";
import { RevenueInstallments } from "./installments";
import { RevenuePaymentStatus } from "./payment-status";

interface ContractRevenuesProps {
	contract: ContractDetail;
	canReadTitles: boolean;
}

export function ContractRevenues({
	contract,
	canReadTitles,
}: ContractRevenuesProps) {
	const { overlay, canGenerate, refreshContract } =
		useRevenueGeneration(contract);
	const revenues = contract.revenues.filter(
		(revenue) => revenue.isActive && !revenue.isSoftDeleted,
	);
	return (
		<div className="space-y-4">
			{revenues.map((revenue) => (
				<FormSection
					key={revenue.id}
					title={revenue.type}
					action={
						canReadTitles ? (
							<RevenuePaymentStatus
								isFullyPaid={revenue.hasGeneratedTitles && revenue.isFullyPaid}
								nextDueDate={
									revenue.hasGeneratedTitles ? revenue.nextDueDate : null
								}
							/>
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
										{formatter.currency(revenue.totalValue)}
									</SensitiveValue>
								),
							},
							{
								term: "Acerto financeiro",
								definition: revenue.hasGeneratedTitles
									? "Títulos gerados"
									: "Aguardando geração de títulos",
							},
							...(canReadTitles
								? [
										{
											term: "Recebido",
											definition: (
												<SensitiveValue>
													{formatter.currency(revenue.paidValue)}
												</SensitiveValue>
											),
										},
										{
											term: "Saldo a receber",
											tooltip:
												"Valor dos títulos menos principal já abatido. Sem títulos gerados, saldo zero.",
											definition: (
												<SensitiveValue>
													{formatter.currency(revenue.remainingValue)}
												</SensitiveValue>
											),
										},
									]
								: []),
						]}
					/>
					{canReadTitles && revenue.hasGeneratedTitles && (
						<RevenueInstallments revenue={revenue} />
					)}
					{canGenerate && !revenue.hasGeneratedTitles && (
						<Button size="sm" onClick={() => overlay.details.open(revenue.id)}>
							Gerar parcelas
						</Button>
					)}
				</FormSection>
			))}
			{revenues.length === 0 && (
				<p className="text-sm text-muted-foreground">
					Nenhuma receita ativa neste contrato.
				</p>
			)}
			{overlay.details.render((id, state) => {
				const revenue = revenues.find((item) => item.id === id);
				return revenue ? (
					<RevenueGenerationForm
						key={id}
						revenueId={id}
						negotiatedAmount={revenue.totalValue}
						state={state}
						onSuccess={async () => {
							await refreshContract();
							state.close();
						}}
					/>
				) : null;
			})}
		</div>
	);
}
