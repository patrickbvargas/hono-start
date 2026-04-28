import * as React from "react";
import {
	type DetailFieldItem,
	EntityDetail,
} from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useRemuneration } from "../../hooks/use-data";

interface RemunerationDetailsProps {
	id: EntityId;
	state: OverlayState;
}

export const RemunerationDetails = ({
	id,
	state,
}: RemunerationDetailsProps) => {
	const { remuneration } = useRemuneration(id);

	const summaryInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "Colaborador", definition: remuneration.employeeName },
			{ term: "Cliente", definition: remuneration.client },
			{ term: "Contrato", definition: remuneration.contractProcessNumber },
			{
				term: "Pagamento",
				definition: formatter.date(remuneration.paymentDate),
			},
			{ term: "Valor", definition: formatter.currency(remuneration.amount) },
			{
				term: "Percentual efetivo",
				definition: formatter.percent(remuneration.effectivePercentage),
			},
		],
		[remuneration],
	);

	const sourceInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "Honorário", definition: `#${remuneration.feeId}` },
			{
				term: "Parcela",
				definition: String(remuneration.feeInstallmentNumber),
			},
			{
				term: "Valor do honorário",
				definition: formatter.currency(remuneration.feeAmount),
			},
			{
				term: "Origem",
				definition: remuneration.isManualOverride
					? "Ajuste manual"
					: "Gerada automaticamente",
			},
			{
				term: "Honorário de origem",
				definition: remuneration.parentFeeIsSoftDeleted ? "Excluído" : "Ativo",
			},
		],
		[remuneration],
	);

	const registerInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Situação",
				definition: (
					<EntityStatus
						isActive={remuneration.isActive}
						isSoftDeleted={remuneration.isSoftDeleted}
					/>
				),
			},
			{ term: "Criado em", definition: formatter.date(remuneration.createdAt) },
			{
				term: "Atualizado em",
				definition: formatter.date(remuneration.updatedAt),
			},
		],
		[remuneration],
	);

	return (
		<EntityDetail
			state={state}
			title={`${remuneration.employeeName} • ${remuneration.contractProcessNumber}`}
		>
			<EntityDetail.Fields items={summaryInfo} />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Origem">
				<EntityDetail.Fields items={sourceInfo} />
			</EntityDetail.Section>
			<EntityDetail.Separator className="mt-auto" />
			<EntityDetail.Section title="Registro">
				<EntityDetail.Fields items={registerInfo} />
			</EntityDetail.Section>
		</EntityDetail>
	);
};
