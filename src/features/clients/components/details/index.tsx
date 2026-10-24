import * as React from "react";
import {
	AttachmentSection,
	AttachmentSectionFallback,
} from "@/features/attachments";
import { contractSearchDefaults } from "@/features/contracts";
import { EntityActions } from "@/shared/components/entity-actions";
import {
	type DetailFieldItem,
	EntityDetail,
} from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import { NavigationLink } from "@/shared/components/navigation-link";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
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
	const session = useLoggedUserSession();
	const actions = getClientLifecycleActions({
		canManageLifecycle,
		isSoftDeleted: client.isSoftDeleted,
	});

	const generalInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "Documento", definition: formatClientDocument(client.document) },
			{ term: "Tipo", definition: client.type },
			{
				term: "Contratos",
				definition:
					hasPermission(session, "org:contracts:read_all") ||
					hasPermission(session, "org:contracts:read_assigned") ? (
						<NavigationLink
							to="/contratos"
							state={{ resetFilterPanel: true }}
							aria-label={`Ver contratos de ${client.fullName}`}
							search={{
								...contractSearchDefaults,
								clientId: String(client.id),
							}}
						>
							{client.contractCount}
						</NavigationLink>
					) : (
						client.contractCount
					),
			},
		],
		[client, session],
	);

	const contactInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "E-mail", definition: client.email ?? "—" },
			{ term: "Telefone", definition: formatter.phone(client.phone) },
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
					viewPermission="org:clients:read"
					editPermission="org:clients:update"
					restorePermission="org:clients:restore"
					deletePermission="org:clients:delete"
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
				<EntityDetail.Fields columns={2} items={generalInfo} />
				<EntityDetail.Separator />
				<EntityDetail.Section title="Contato">
					<EntityDetail.Fields columns={2} items={contactInfo} />
				</EntityDetail.Section>
				<EntityDetail.Separator />
				<EntityDetail.Section title="Anexos">
					<AttachmentSection canUpload ownerId={id} ownerKind="client" />
				</EntityDetail.Section>
				<EntityDetail.Separator />
				<EntityDetail.Section title="Registro">
					<EntityDetail.Fields columns={2} items={registerInfo} />
				</EntityDetail.Section>
			</EntityDetail.Body>
			<EntityDetail.Footer />
		</EntityDetail.Content>
	);
};

const ClientDetailsFallback = () => (
	<EntityDetail.Content>
		<EntityDetail.SkeletonHeader withActions />
		<EntityDetail.Body>
			<EntityDetail.SkeletonFields columns={2} rows={3} />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Contato">
				<EntityDetail.SkeletonFields columns={2} rows={2} />
			</EntityDetail.Section>
			<EntityDetail.Separator />
			<EntityDetail.Section title="Anexos">
				<AttachmentSectionFallback canUpload />
			</EntityDetail.Section>
			<EntityDetail.Separator />
			<EntityDetail.Section title="Registro">
				<EntityDetail.SkeletonFields columns={2} rows={3} />
			</EntityDetail.Section>
		</EntityDetail.Body>
		<EntityDetail.Footer />
	</EntityDetail.Content>
);
