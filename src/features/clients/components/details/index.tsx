import { useSearch } from "@tanstack/react-router";
import * as React from "react";
import { AttachmentSectionFallback } from "@/features/attachments";
import { EntityActions } from "@/shared/components/entity-actions";
import { EntityDetail } from "@/shared/components/entity-detail";
import { NavigationLink } from "@/shared/components/navigation-link";
import type { EntityId } from "@/shared/schemas/entity";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import type { OverlayState } from "@/shared/types/overlay";
import { useClient } from "../../hooks/use-data";
import { clientSearchSchema } from "../../schemas/search";
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
	const currentSearch = useSearch({ strict: false });
	const { client } = useClient(id);
	const actions = getClientLifecycleActions({
		canManageLifecycle,
		isSoftDeleted: client.isSoftDeleted,
	});

	const workspaceLink = (
		<NavigationLink
			to="/clientes/$clientId"
			params={{ clientId: String(id) }}
			search={{
				tab: "overview",
				returnTo: clientSearchSchema.parse(currentSearch),
			}}
			className="inline-flex items-center gap-1 text-xs font-medium"
		>
			Abrir página
		</NavigationLink>
	);

	return (
		<EntityDetail.Content>
			<EntityDetail.Header className="flex-row items-center justify-between gap-3">
				<EntityDetail.Title className="min-w-0 flex-1 truncate">
					{client.fullName}
				</EntityDetail.Title>
				<div className="hidden shrink-0 sm:block">{workspaceLink}</div>
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
				<div className="sm:hidden">{workspaceLink}</div>
				<ClientOverview id={id} />
			</EntityDetail.Body>
			<EntityDetail.Footer />
		</EntityDetail.Content>
	);
};

const ClientDetailsFallback = () => {
	const session = useLoggedUserSession();
	return (
		<EntityDetail.Content>
			<EntityDetail.SkeletonHeader withActions withPageLink />
			<EntityDetail.Body>
				<EntityDetail.SkeletonPageLink />
				<EntityDetail.SkeletonFields columns={2} rows={3} />
				<EntityDetail.Separator />
				<EntityDetail.Section title="Contato">
					<EntityDetail.SkeletonFields columns={2} rows={2} />
				</EntityDetail.Section>
				{hasPermission(session, "org:contracts:read_all") &&
					hasPermission(session, "org:fees:read_all") && (
						<>
							<EntityDetail.Separator />
							<EntityDetail.Section title="Financeiro">
								<EntityDetail.SkeletonFields columns={2} rows={4} />
								<EntityDetail.SkeletonTitle className="mt-3 h-5 w-36" />
							</EntityDetail.Section>
						</>
					)}
				{hasPermission(session, "org:attachments:read") && (
					<>
						<EntityDetail.Separator />
						<AttachmentSectionFallback
							canUpload={
								hasPermission(session, "org:attachments:upload") &&
								hasPermission(session, "org:clients:update")
							}
						/>
					</>
				)}
				<EntityDetail.Separator />
				<EntityDetail.Section title="Registro">
					<EntityDetail.SkeletonFields columns={2} rows={3} />
				</EntityDetail.Section>
			</EntityDetail.Body>
			<EntityDetail.Footer />
		</EntityDetail.Content>
	);
};
