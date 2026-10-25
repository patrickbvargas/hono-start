import * as React from "react";
import { AttachmentSectionFallback } from "@/features/attachments";
import { EntityActions } from "@/shared/components/entity-actions";
import { EntityDetail } from "@/shared/components/entity-detail";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useClient } from "../../hooks/use-data";
import { getClientLifecycleActions } from "../../utils/lifecycle-actions";
import { ClientOverview } from "./overview";

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
				<ClientOverview id={id} />
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
			<AttachmentSectionFallback canUpload />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Registro">
				<EntityDetail.SkeletonFields columns={2} rows={3} />
			</EntityDetail.Section>
		</EntityDetail.Body>
		<EntityDetail.Footer />
	</EntityDetail.Content>
);
