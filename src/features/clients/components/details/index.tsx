import { useSuspenseQuery } from "@tanstack/react-query";
import * as React from "react";
import { AttachmentSection } from "@/features/attachments";
import {
	EntityDetail,
	type DetailFieldItem,
} from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { getClientByIdQueryOptions } from "../../api/queries";
import { formatClientDocument } from "../../utils/format";

interface ClientDetailsProps {
	id: EntityId;
	state: OverlayState;
}

export const ClientDetails = ({ id, state }: ClientDetailsProps) => {
	const { data } = useSuspenseQuery(getClientByIdQueryOptions(id));

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
		<EntityDetail state={state} title={data.fullName}>
			<EntityDetail.Fields items={generalInfo} />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Contato">
				<EntityDetail.Fields items={contactInfo} />
			</EntityDetail.Section>
			<EntityDetail.Separator className="mt-auto" />
			<AttachmentSection
				ownerId={data.id}
				ownerKind="client"
				canUpload={!data.isSoftDeleted}
			/>
			<EntityDetail.Separator />
			<EntityDetail.Section title="Registro">
				<EntityDetail.Fields items={registerInfo} />
			</EntityDetail.Section>
		</EntityDetail>
	);
};
