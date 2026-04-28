import * as React from "react";
import { AttachmentSection } from "@/features/attachments";
import {
	type DetailFieldItem,
	EntityDetail,
} from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useClient } from "../../hooks/use-data";
import { formatClientDocument } from "../../utils/format";

interface ClientDetailsProps {
	id: EntityId;
	state: OverlayState;
}

export const ClientDetails = ({ id, state }: ClientDetailsProps) => {
	const { client } = useClient(id);

	const generalInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "Documento", definition: formatClientDocument(client.document) },
			{ term: "Tipo", definition: client.type },
			{ term: "Contratos", definition: client.contractCount },
		],
		[client],
	);

	const contactInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "Email", definition: client.email ?? "—" },
			{ term: "Telefone", definition: client.phone ?? "—" },
		],
		[client],
	);

	const registerInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Status",
				definition: (
					<EntityStatus
						isActive={client.isActive}
						isSoftDeleted={client.isSoftDeleted}
					/>
				),
			},
			{ term: "Criado em", definition: formatter.date(client.createdAt) },
		],
		[client],
	);

	return (
		<EntityDetail state={state} title={client.fullName}>
			<EntityDetail.Fields items={generalInfo} />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Contato">
				<EntityDetail.Fields items={contactInfo} />
			</EntityDetail.Section>
			<EntityDetail.Separator className="mt-auto" />
			<AttachmentSection
				ownerId={client.id}
				ownerKind="client"
				canUpload={!client.isSoftDeleted}
			/>
			<EntityDetail.Separator />
			<EntityDetail.Section title="Registro">
				<EntityDetail.Fields items={registerInfo} />
			</EntityDetail.Section>
		</EntityDetail>
	);
};
