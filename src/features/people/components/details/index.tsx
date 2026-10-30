import { useSearch } from "@tanstack/react-router";
import * as React from "react";
import { AttachmentSectionFallback } from "@/features/attachments";
import { EntityActions } from "@/shared/components/entity-actions";
import { EntityDetail } from "@/shared/components/entity-detail";
import { NavigationLink } from "@/shared/components/navigation-link";
import type { EntityId } from "@/shared/schemas/entity";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import type { OverlayState } from "@/shared/types/overlay";
import { usePerson } from "../../hooks/use-data";
import { personSearchSchema } from "../../schemas/search";
import { getPersonLifecycleActions } from "../../utils/lifecycle-actions";
import { PersonOverview } from "./overview";

interface PersonDetailsProps {
	canManageLifecycle?: boolean;
	id: EntityId;
	onDelete?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
	state: OverlayState;
}

export const PersonDetails = ({
	canManageLifecycle = false,
	id,
	onDelete,
	onEdit,
	onRestore,
	state,
}: PersonDetailsProps) => {
	return (
		<EntityDetail.Root key={id} state={state}>
			<React.Suspense fallback={<PersonDetailsFallback />}>
				<PersonDetailsContent
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

interface PersonDetailsContentProps {
	canManageLifecycle: boolean;
	id: EntityId;
	onDelete?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

const PersonDetailsContent = ({
	canManageLifecycle,
	id,
	onDelete,
	onEdit,
	onRestore,
}: PersonDetailsContentProps) => {
	const currentSearch = useSearch({ strict: false });
	const { person } = usePerson(id);
	const actions = getPersonLifecycleActions({
		canManageLifecycle,
		isSoftDeleted: person.isSoftDeleted,
	});

	const workspaceLink = (
		<NavigationLink
			to="/pessoas/$personId"
			params={{ personId: String(id) }}
			search={{
				tab: "overview",
				returnTo: personSearchSchema.parse(currentSearch),
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
					{person.fullName}
				</EntityDetail.Title>
				<div className="hidden shrink-0 sm:block">{workspaceLink}</div>
				<EntityActions
					viewPermission={[
						"org:people:read",
						"org:clients:read",
						"org:suppliers:read",
						"org:employees:read",
					]}
					editPermission="org:people:update"
					restorePermission="org:people:restore"
					deletePermission="org:people:delete"
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
				<PersonOverview id={id} />
			</EntityDetail.Body>
			<EntityDetail.Footer />
		</EntityDetail.Content>
	);
};

const PersonDetailsFallback = () => {
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
								hasPermission(session, "org:people:update")
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
