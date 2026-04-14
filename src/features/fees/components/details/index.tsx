import { useSuspenseQuery } from "@tanstack/react-query";
import * as React from "react";
import {
	Detail,
	type DetailFieldItem,
} from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import { formatter } from "@/shared/lib/formatter";
import type { OverlayState } from "@/shared/types/overlay";
import { getFeeByIdOptions } from "../../api/get";
import type { Fee } from "../../schemas/model";

interface FeeDetailsProps {
	fee: Fee;
	state: OverlayState;
}

export const FeeDetails = ({ fee, state }: FeeDetailsProps) => {
	const { data } = useSuspenseQuery(getFeeByIdOptions(fee.id));

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
		<Detail state={state} title={data.contractProcessNumber}>
			<Detail.Fields items={generalInfo} />
			<Detail.Separator />
			<Detail.Section title="Remuneração">
				<Detail.Fields items={remunerationInfo} />
			</Detail.Section>
			<Detail.Separator className="mt-auto" />
			<Detail.Section title="Registro">
				<Detail.Fields items={registerInfo} />
			</Detail.Section>
		</Detail>
	);
};
