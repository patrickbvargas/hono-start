import * as React from "react";
import { AttachmentSection } from "@/features/attachments";
import { EntityActions } from "@/shared/components/entity-actions";
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
import { getClientLifecycleActions } from "../../utils/lifecycle-actions";

interface ClientDetailsProps {
	canManageLifecycle?: boolean;
	id: EntityId;
	onDelete?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
	state: OverlayState;
}

export const ClientDetails = ({
	canManageLifecycle = false,
	id,
	onDelete,
	onEdit,
	onRestore,
	state,
}: ClientDetailsProps) => {
	return (
		<EntityDetail.Root key={id} state={state}>
			<React.Suspense fallback={<ClientDetailsFallback />}>
				<ClientDetailsContent
					canManageLifecycle={canManageLifecycle}
					id={id}
					onDelete={onDelete}
					onEdit={onEdit}
					onRestore={onRestore}
				/>
			</React.Suspense>
		</EntityDetail.Root>
	);
};

interface ClientDetailsContentProps {
	canManageLifecycle: boolean;
	id: EntityId;
	onDelete?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

const ClientDetailsContent = ({
	canManageLifecycle,
	id,
	onDelete,
	onEdit,
	onRestore,
}: ClientDetailsContentProps) => {
	const { client } = useClient(id);
	const actions = getClientLifecycleActions({
		canManageLifecycle,
		isSoftDeleted: client.isSoftDeleted,
	});

	const generalInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "Documento", definition: formatClientDocument(client.document) },
			{ term: "Tipo", definition: client.type },
			{ term: "Contratos vinculados", definition: client.contractCount },
		],
		[client],
	);

	const contactInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "E-mail", definition: client.email ?? "—" },
			{ term: "Telefone", definition: client.phone ?? "—" },
		],
		[client],
	);

	const registerInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Situação",
				definition: (
					<EntityStatus
						isActive={client.isActive}
						isSoftDeleted={client.isSoftDeleted}
					/>
				),
			},
			{ term: "Criado em", definition: formatter.date(client.createdAt) },
			{
				term: "Atualizado em",
				definition: client.updatedAt ? formatter.date(client.updatedAt) : "—",
			},
		],
		[client],
	);

	return (
		<EntityDetail.Content>
			<EntityDetail.Header className="flex-row items-center justify-between gap-3">
				<EntityDetail.Title>{client.fullName}</EntityDetail.Title>
				<EntityActions
					canView={false}
					canEdit={actions.canEdit}
					canRestore={actions.canRestore}
					canDelete={actions.canDelete}
					onEdit={onEdit ? () => onEdit(id) : undefined}
					onRestore={onRestore ? () => onRestore(id) : undefined}
					onDelete={onDelete ? () => onDelete(id) : undefined}
				/>
			</EntityDetail.Header>
			<EntityDetail.Body>
				<EntityDetail.Fields items={generalInfo} />
				<EntityDetail.Separator />
				<EntityDetail.Section title="Contato">
					<EntityDetail.Fields items={contactInfo} />
				</EntityDetail.Section>
				<EntityDetail.Separator />
				<EntityDetail.Section title="Anexos">
					<AttachmentSection canUpload ownerId={id} ownerKind="client" />
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
			<EntityDetail.Section title="Anexos">
				<AttachmentSection
					canUpload
					ownerId={idPlaceholder}
					ownerKind="client"
				/>
			</EntityDetail.Section>
			<EntityDetail.Separator />
			<EntityDetail.Section title="Registro">
				<EntityDetail.SkeletonFields rows={3} />
			</EntityDetail.Section>
		</EntityDetail.Body>
		<EntityDetail.Footer />
	</EntityDetail.Content>
);

const idPlaceholder = 0 as EntityId;
