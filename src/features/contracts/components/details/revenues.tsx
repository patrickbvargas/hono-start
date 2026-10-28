import { feeSearchDefaults } from "@/features/fees";
import { EntityDetail } from "@/shared/components/entity-detail";
import { FormSection } from "@/shared/components/form-section";
import { NavigationLink } from "@/shared/components/navigation-link";
import { Button } from "@/shared/components/ui";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import type { ContractDetail } from "../../schemas/model";
import { RevenuePaymentStatus } from "./payment-status";

interface ContractRevenuesProps {
	contract: ContractDetail;
	canReadFees: boolean;
	onRegister: (id: number) => void;
}
export function ContractRevenues({
	contract,
	canReadFees,
	onRegister,
}: ContractRevenuesProps) {
	const session = useLoggedUserSession();
	return (
		<div className="space-y-4">
			{contract.revenues
				.filter((revenue) => revenue.isActive && !revenue.isSoftDeleted)
				.map((revenue) => (
					<FormSection
						key={revenue.id}
						title={revenue.type}
						action={
							<RevenuePaymentStatus
								isFullyPaid={revenue.isFullyPaid}
								paidValue={revenue.paidValue}
								nextDueDate={revenue.nextDueDate}
							/>
						}
					>
						<EntityDetail.Fields
							columns={2}
							items={[
								{
									term: "Valor contratado",
									definition: (
										<SensitiveValue>
											{formatter.currency(revenue.totalValue)}
										</SensitiveValue>
									),
								},
								{
									term: "Valor entrada",
									definition: (
										<SensitiveValue>
											{formatter.currency(revenue.downPaymentValue ?? 0)}
										</SensitiveValue>
									),
								},
								{
									term: "Recebido (inclui entrada)",
									definition: (
										<SensitiveValue>
											{formatter.currency(revenue.paidValue)}
										</SensitiveValue>
									),
								},
								{
									term: "Saldo a receber",
									definition: (
										<SensitiveValue>
											{formatter.currency(revenue.remainingValue)}
										</SensitiveValue>
									),
								},
								{
									term: "Parcelas registradas",
									definition: `${revenue.installmentsPaid} de ${revenue.totalInstallments}`,
								},
								{
									term: "Próximo vencimento em aberto",
									definition:
										revenue.isFullyPaid || !revenue.nextDueDate
											? "—"
											: formatter.calendarDate(revenue.nextDueDate),
								},
							]}
						/>
						<div className="flex flex-wrap items-center gap-3">
							{hasPermission(session, "org:fees:create") &&
							canReadFees &&
							contract.isActive &&
							!contract.isSoftDeleted &&
							contract.statusValue === "ACTIVE" &&
							!revenue.isFullyPaid &&
							revenue.nextInstallmentNumber !== null ? (
								<Button
									size="sm"
									onClick={() => {
										onRegister(revenue.id);
									}}
								>
									Registrar recebimento
								</Button>
							) : null}
							{canReadFees ? (
								<NavigationLink
									to="/honorarios"
									state={{ resetFilterPanel: true }}
									aria-label={`Ver recebimentos da receita ${revenue.type}`}
									search={{
										...feeSearchDefaults,
										contractId: String(contract.id),
										revenueId: String(revenue.id),
									}}
									className="text-sm"
								>
									Recebimentos
								</NavigationLink>
							) : null}
						</div>
					</FormSection>
				))}
			{contract.revenues.filter((r) => r.isActive && !r.isSoftDeleted)
				.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					Nenhuma receita ativa neste contrato.
				</p>
			) : null}
		</div>
	);
}
