import { feeSearchDefaults } from "@/features/fees";
import { EntityDetail } from "@/shared/components/entity-detail";
import { EntityFields } from "@/shared/components/entity-fields";
import { FormSection } from "@/shared/components/form-section";
import { NavigationLink } from "@/shared/components/navigation-link";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import { useClientFinance } from "../../hooks/use-data";

interface ClientFinanceProps {
	id: number;
	compact?: boolean;
}
export function ClientFinance({ id, compact = false }: ClientFinanceProps) {
	const { finance } = useClientFinance(id);
	const Section = compact ? EntityDetail.Section : FormSection;
	return (
		<Section title="Financeiro">
			<EntityFields
				columns={2}
				items={[
					{
						term: "Contratos",
						definition: String(finance.contractCount),
					},
					{
						term: "Valor contratado",
						definition: (
							<SensitiveValue>
								{formatter.currency(finance.totalValue)}
							</SensitiveValue>
						),
					},
					{
						term: "Recebido (inclui entrada)",
						definition: (
							<SensitiveValue>
								{formatter.currency(finance.paidValue)}
							</SensitiveValue>
						),
					},
					{
						term: "Saldo a receber",
						definition: (
							<SensitiveValue>
								{formatter.currency(finance.remainingValue)}
							</SensitiveValue>
						),
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
		</Section>
	);
}
