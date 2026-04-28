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
import { getFeeByIdQueryOptions } from "../../api/queries";

interface FeeDetailsProps {
	id: EntityId;
	state: OverlayState;
}

export const FeeDetails = ({ id, state }: FeeDetailsProps) => {
	const { data } = useSuspenseQuery(getFeeByIdQueryOptions(id));

	const generalInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "Contrato", definition: data.contractProcessNumber },
			{ term: "Cliente", definition: data.client },
			{ term: "Receita", definition: data.revenueType },
			{ term: "Pagamento", definition: formatter.date(data.paymentDate) },
			{ term: "Valor", definition: formatter.currency(data.amount) },
			{ term: "Parcela", definition: String(data.installmentNumber) },
		],
		[data],
	);

	const remunerationInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Gera remuneração",
				definition: data.generatesRemuneration ? "Sim" : "Não",
			},
			{
				term: "Remunerações vinculadas",
				definition: String(data.remunerationCount),
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
		],
		[data],
	);

	return (
		<EntityDetail state={state} title={data.contractProcessNumber}>
			<EntityDetail.Fields items={generalInfo} />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Remuneração">
				<EntityDetail.Fields items={remunerationInfo} />
			</EntityDetail.Section>
			<EntityDetail.Separator className="mt-auto" />
			<EntityDetail.Section title="Registro">
				<EntityDetail.Fields items={registerInfo} />
			</EntityDetail.Section>
		</EntityDetail>
	);
};
