import { useSuspenseQuery } from "@tanstack/react-query";
import * as React from "react";
import {
	Detail,
	type DetailFieldItem,
} from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { getEmployeeByIdQueryOptions } from "../../api/queries";

interface EmployeeDetailsProps {
	id: EntityId;
	state: OverlayState;
}

export const EmployeeDetails = ({ id, state }: EmployeeDetailsProps) => {
	const { data } = useSuspenseQuery(getEmployeeByIdQueryOptions(id));

	const generalInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "OAB", definition: formatter.oab(data.oabNumber) },
			{ term: "Cargo", definition: data.type },
			{ term: "Perfil", definition: data.role },
			{ term: "Contratos", definition: data.contractCount },
		],
		[data],
	);

	const contactInfo = React.useMemo<DetailFieldItem[]>(
		() => [{ term: "Email", definition: data.email }],
		[data],
	);

	const financialInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Remuneração",
				definition: formatter.percent(data.remunerationPercent),
			},
		],
		[data],
	);

	const registerInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Status",
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
		<Detail state={state} title={data.fullName}>
			<Detail.Fields items={generalInfo} />
			<Detail.Separator />
			<Detail.Section title="Contato">
				<Detail.Fields items={contactInfo} />
			</Detail.Section>
			<Detail.Separator />
			<Detail.Section title="Financeiro">
				<Detail.Fields items={financialInfo} />
			</Detail.Section>
			<Detail.Separator className="mt-auto" />
			<Detail.Section title="Registro">
				<Detail.Fields items={registerInfo} />
			</Detail.Section>
		</Detail>
	);
};
