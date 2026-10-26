import { feeSearchDefaults } from "@/features/fees";
import { EntityFields } from "@/shared/components/entity-fields";
import { FormSection } from "@/shared/components/form-section";
import { NavigationLink } from "@/shared/components/navigation-link";
import { formatter } from "@/shared/lib/formatter";
import { useClientFinance } from "../../hooks/use-data";

interface ClientFinanceProps {
	id: number;
}
export function ClientFinance({ id }: ClientFinanceProps) {
	const { finance } = useClientFinance(id);
	return (
		<FormSection title="Resumo financeiro">
			<EntityFields
				columns={2}
				items={[
					{
						term: "Valor contratado",
						definition: formatter.currency(finance.totalValue),
					},
					{
						term: "Recebido (inclui entrada)",
						definition: formatter.currency(finance.paidValue),
					},
					{
						term: "Saldo a receber",
						definition: formatter.currency(finance.remainingValue),
					},
				]}
			/>
			<div className="mt-3 text-sm">
				<NavigationLink
					to="/honorarios"
					search={{ ...feeSearchDefaults, clientId: id, active: "true" }}
					state={{ resetFilterPanel: true }}
				>
					Ver recebimentos
				</NavigationLink>
			</div>
		</FormSection>
	);
}
