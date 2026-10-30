import { EntityDetail } from "@/shared/components/entity-detail";
import { EntityFields } from "@/shared/components/entity-fields";
import { FormSection } from "@/shared/components/form-section";
import { SensitiveValue } from "@/shared/components/value-visibility";
import { formatter } from "@/shared/lib/formatter";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import { usePersonFinance } from "../../hooks/use-data";

interface PersonFinanceProps {
	id: number;
	compact?: boolean;
}
export function PersonFinance({ id, compact = false }: PersonFinanceProps) {
	const { finance } = usePersonFinance(id);
	const session = useLoggedUserSession();
	const Section = compact ? EntityDetail.Section : FormSection;
	const value = (n: number) => (
		<SensitiveValue>{formatter.currency(n)}</SensitiveValue>
	);
	return (
		<Section title="Financeiro">
			<EntityFields
				columns={2}
				items={[
					{ term: "Contratos", definition: String(finance.contractCount) },
					...(hasPermission(session, "org:receivables:read_all") &&
					hasPermission(session, "org:receipts:read_all")
						? [
								{
									term: "Valor contratado",
									definition: value(finance.totalValue),
								},
								{
									term: "Recebido (inclui entrada)",
									definition: value(finance.paidValue),
								},
								{
									term: "Saldo a receber",
									definition: value(finance.remainingValue),
								},
							]
						: []),
					...(hasPermission(session, "org:payables:read_all") &&
					hasPermission(session, "org:payments:read_all")
						? [
								{
									term: "Valor a pagar",
									definition: value(finance.payableValue),
								},
								{ term: "Pago", definition: value(finance.paidOutValue) },
								{
									term: "Saldo a pagar",
									definition: value(finance.payableBalance),
								},
							]
						: []),
				]}
			/>
		</Section>
	);
}
