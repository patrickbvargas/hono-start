import { feeSearchDefaults } from "@/features/fees";
import { EntityDetail } from "@/shared/components/entity-detail";
import { NavigationLink } from "@/shared/components/navigation-link";
import { Button } from "@/shared/components/ui";
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
					<div key={revenue.id} className="space-y-3 rounded-lg border p-3">
						<div className="flex items-center justify-between gap-3">
							<h3 className="font-medium">{revenue.type}</h3>
							<RevenuePaymentStatus
								isFullyPaid={revenue.isFullyPaid}
								paidValue={revenue.paidValue}
								nextDueDate={revenue.nextDueDate}
							/>
						</div>
						<EntityDetail.Fields
							columns={2}
							items={[
								{
									term: "Valor contratado",
									definition: formatter.currency(revenue.totalValue),
								},
								{
									term: "Recebido (inclui entrada)",
									definition: formatter.currency(revenue.paidValue),
								},
								{
									term: "A receber",
									definition: formatter.currency(revenue.remainingValue),
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
								className="inline-flex p-2 text-sm underline underline-offset-4"
							>
								Recebimentos
							</NavigationLink>
						) : null}
					</div>
				))}{" "}
			{contract.revenues.filter((r) => r.isActive && !r.isSoftDeleted)
				.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					Nenhuma receita ativa neste contrato.
				</p>
			) : null}
		</div>
	);
}
