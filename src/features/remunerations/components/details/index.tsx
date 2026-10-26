import { useSearch } from "@tanstack/react-router";
import * as React from "react";
import { AttachmentSectionFallback } from "@/features/attachments";
import { EntityActions } from "@/shared/components/entity-actions";
import { EntityDetail } from "@/shared/components/entity-detail";
import { NavigationLink } from "@/shared/components/navigation-link";
import { Skeleton } from "@/shared/components/ui";
import type { EntityId } from "@/shared/schemas/entity";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import type { OverlayState } from "@/shared/types/overlay";
import { useRemuneration } from "../../hooks/use-data";
import { remunerationSearchSchema } from "../../schemas/search";
import { getRemunerationLifecycleActions } from "../../utils/lifecycle-actions";
import { RemunerationOverview } from "./overview";

interface RemunerationDetailsProps {
	id: EntityId;
	canManageLifecycle?: boolean;
	onDelete?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
	state: OverlayState;
}

export const RemunerationDetails = ({
	canManageLifecycle = false,
	id,
	onDelete,
	onEdit,
	onRestore,
	state,
}: RemunerationDetailsProps) => {
	return (
		<EntityDetail.Root key={id} state={state}>
			<React.Suspense fallback={<RemunerationDetailsFallback />}>
				<RemunerationDetailsContent
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

interface RemunerationDetailsContentProps {
	canManageLifecycle: boolean;
	id: EntityId;
	onDelete?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

const RemunerationDetailsContent = ({
	canManageLifecycle,
	id,
	onDelete,
	onEdit,
	onRestore,
}: RemunerationDetailsContentProps) => {
	const currentSearch = useSearch({ strict: false });
	const { remuneration } = useRemuneration(id);
	const actions = getRemunerationLifecycleActions({
		canManageLifecycle,
		isSoftDeleted: remuneration.isSoftDeleted,
	});

	const workspaceLink = (
		<NavigationLink
			to="/remuneracoes/$remunerationId"
			params={{ remunerationId: String(id) }}
			search={{
				tab: "overview",
				returnTo: remunerationSearchSchema.parse(currentSearch),
			}}
			className="inline-flex items-center gap-1 text-xs font-medium"
		>
			Abrir página
		</NavigationLink>
	);

	return (
		<EntityDetail.Content>
			<EntityDetail.Header className="flex-row items-center justify-between gap-3">
				<EntityDetail.Title className="min-w-0 flex-1 truncate">{`${remuneration.employeeName} • ${remuneration.contractProcessNumber}`}</EntityDetail.Title>
				<div className="hidden shrink-0 sm:block">{workspaceLink}</div>
				<EntityActions
					viewPermission={[
						"org:remunerations:read_all",
						"org:remunerations:read_own",
					]}
					editPermission="org:remunerations:update"
					restorePermission="org:remunerations:restore"
					deletePermission="org:remunerations:delete"
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
				<RemunerationOverview id={id} />
			</EntityDetail.Body>
			<EntityDetail.Footer />
		</EntityDetail.Content>
	);
};

const RemunerationDetailsFallback = () => {
	const session = useLoggedUserSession();
	return (
		<EntityDetail.Content>
			<EntityDetail.SkeletonHeader withActions withPageLink />
			<EntityDetail.Body>
				<EntityDetail.SkeletonPageLink />
				<EntityDetail.SkeletonFields columns={2} rows={6} />
				<EntityDetail.Separator />
				<EntityDetail.Section title="Entender cálculo">
					<div className="mb-3 space-y-2 rounded-lg border bg-muted/30 p-3 text-sm">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-5 w-3/4" />
						<Skeleton className="h-10 w-full sm:h-5" />
					</div>
					<EntityDetail.SkeletonFields columns={2} rows={7} />
				</EntityDetail.Section>
				<EntityDetail.Separator />
				{hasPermission(session, "org:attachments:read") && (
					<>
						<AttachmentSectionFallback
							canUpload={hasPermission(session, "org:attachments:upload")}
						/>
						<EntityDetail.Separator />
					</>
				)}
				<EntityDetail.Section title="Registro">
					<EntityDetail.SkeletonFields columns={2} rows={3} />
				</EntityDetail.Section>
			</EntityDetail.Body>
			<EntityDetail.Footer />
		</EntityDetail.Content>
	);
};
