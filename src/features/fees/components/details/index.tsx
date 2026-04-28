import * as React from "react";
import {
	type DetailFieldItem,
	EntityDetail,
} from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useFee } from "../../hooks/use-data";

interface FeeDetailsProps {
	id: EntityId;
	state: OverlayState;
}

export const FeeDetails = ({ id, state }: FeeDetailsProps) => {
	const { fee } = useFee(id);

	const generalInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "Contrato", definition: fee.contractProcessNumber },
			{ term: "Cliente", definition: fee.client },
			{ term: "Receita", definition: fee.revenueType },
			{ term: "Pagamento", definition: formatter.date(fee.paymentDate) },
			{ term: "Valor", definition: formatter.currency(fee.amount) },
			{ term: "Parcela", definition: String(fee.installmentNumber) },
		],
		[fee],
	);

	const remunerationInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Gera remuneração",
				definition: fee.generatesRemuneration ? "Sim" : "Não",
			},
			{
				term: "Remunerações vinculadas",
				definition: String(fee.remunerationCount),
			},
		],
		[fee],
	);

	const registerInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Situação",
				definition: (
					<EntityStatus
						isActive={fee.isActive}
						isSoftDeleted={fee.isSoftDeleted}
					/>
				),
			},
			{ term: "Criado em", definition: formatter.date(fee.createdAt) },
		],
		[fee],
	);

	return (
		<EntityDetail state={state} title={fee.contractProcessNumber}>
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
