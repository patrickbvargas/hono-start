import { useSuspenseQuery } from "@tanstack/react-query";
import * as React from "react";
import {
	type DetailFieldItem,
	EntityDetail,
} from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { getRemunerationByIdQueryOptions } from "../../api/queries";

interface RemunerationDetailsProps {
	id: EntityId;
	state: OverlayState;
}

export const RemunerationDetails = ({
	id,
	state,
}: RemunerationDetailsProps) => {
	const { data } = useSuspenseQuery(getRemunerationByIdQueryOptions(id));

	const summaryInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "Colaborador", definition: data.employeeName },
			{ term: "Cliente", definition: data.client },
			{ term: "Contrato", definition: data.contractProcessNumber },
			{ term: "Pagamento", definition: formatter.date(data.paymentDate) },
			{ term: "Valor", definition: formatter.currency(data.amount) },
			{
				term: "Percentual efetivo",
				definition: formatter.percent(data.effectivePercentage),
			},
		],
		[data],
	);

	const sourceInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "Honorário", definition: `#${data.feeId}` },
			{ term: "Parcela", definition: String(data.feeInstallmentNumber) },
			{
				term: "Valor do honorário",
				definition: formatter.currency(data.feeAmount),
			},
			{
				term: "Origem",
				definition: data.isManualOverride
					? "Ajuste manual"
					: "Gerada automaticamente",
			},
			{
				term: "Honorário de origem",
				definition: data.parentFeeIsSoftDeleted ? "Excluído" : "Ativo",
			},
		],
		[data],
	);

	const registerInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Situação",
				definition: (
					<EntityStatus
						isActive={data.isActive}
						isSoftDeleted={data.isSoftDeleted}
					/>
				),
			},
			{ term: "Criado em", definition: formatter.date(data.createdAt) },
			{ term: "Atualizado em", definition: formatter.date(data.updatedAt) },
		],
		[data],
	);

	return (
		<EntityDetail
			state={state}
			title={`${data.employeeName} • ${data.contractProcessNumber}`}
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
