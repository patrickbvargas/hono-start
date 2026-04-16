import { useSuspenseQuery } from "@tanstack/react-query";
import * as React from "react";
import {
	Detail,
	type DetailFieldItem,
} from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import { formatter } from "@/shared/lib/formatter";
import type { OverlayState } from "@/shared/types/overlay";
import { getClientByIdOptions } from "../../api/queries";
import type { Client } from "../../schemas/model";
import { formatClientDocument } from "../../utils/formatting";

interface ClientDetailsProps {
	client: Client;
	state: OverlayState;
}

export const ClientDetails = ({ client, state }: ClientDetailsProps) => {
	const { data } = useSuspenseQuery(getClientByIdOptions(client.id));

	const generalInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "Documento", definition: formatClientDocument(data.document) },
			{ term: "Tipo", definition: data.type },
			{ term: "Contratos", definition: data.contractCount },
		],
		[data],
	);

	const contactInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "Email", definition: data.email ?? "—" },
			{ term: "Telefone", definition: data.phone ?? "—" },
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
			<Detail.Separator className="mt-auto" />
			<Detail.Section title="Registro">
				<Detail.Fields items={registerInfo} />
			</Detail.Section>
		</Detail>
	);
};
