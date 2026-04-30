import * as React from "react";
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
	return (
		<EntityDetail.Root key={id} state={state}>
			<React.Suspense fallback={<ClientDetailsFallback />}>
				<ClientDetailsContent id={id} />
			</React.Suspense>
		</EntityDetail.Root>
	);
};

const ClientDetailsContent = ({ id }: { id: EntityId }) => {
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
		<EntityDetail.Content>
			<EntityDetail.Header>
				<EntityDetail.Title>{client.fullName}</EntityDetail.Title>
			</EntityDetail.Header>
			<EntityDetail.Body>
				<EntityDetail.Fields items={generalInfo} />
				<EntityDetail.Separator />
				<EntityDetail.Section title="Contato">
					<EntityDetail.Fields items={contactInfo} />
				</EntityDetail.Section>
				<EntityDetail.Separator />
				<EntityDetail.Section title="Registro">
					<EntityDetail.Fields items={registerInfo} />
				</EntityDetail.Section>
			</EntityDetail.Body>
			<EntityDetail.Footer />
		</EntityDetail.Content>
	);
};

const ClientDetailsFallback = () => (
	<EntityDetail.Content>
		<EntityDetail.Header>
			<EntityDetail.Title>
				<EntityDetail.SkeletonTitle />
			</EntityDetail.Title>
		</EntityDetail.Header>
		<EntityDetail.Body>
			<EntityDetail.SkeletonFields rows={3} />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Contato">
				<EntityDetail.SkeletonFields rows={2} />
			</EntityDetail.Section>
			<EntityDetail.Separator />
			<EntityDetail.Section title="Registro">
				<EntityDetail.SkeletonFields rows={2} />
			</EntityDetail.Section>
		</EntityDetail.Body>
		<EntityDetail.Footer />
	</EntityDetail.Content>
);
