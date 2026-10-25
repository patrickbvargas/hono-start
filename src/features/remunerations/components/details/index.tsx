import * as React from "react";
import { EntityActions } from "@/shared/components/entity-actions";
import { EntityDetail } from "@/shared/components/entity-detail";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useRemuneration } from "../../hooks/use-data";
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
	const { remuneration } = useRemuneration(id);
	const actions = getRemunerationLifecycleActions({
		canManageLifecycle,
		isSoftDeleted: remuneration.isSoftDeleted,
	});

	return (
		<EntityDetail.Content>
			<EntityDetail.Header className="flex-row items-center justify-between gap-3">
				<EntityDetail.Title>
					{`${remuneration.employeeName} • ${remuneration.contractProcessNumber}`}
				</EntityDetail.Title>
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
				<RemunerationOverview id={id} />
			</EntityDetail.Body>
			<EntityDetail.Footer />
		</EntityDetail.Content>
	);
};

const RemunerationDetailsFallback = () => (
	<EntityDetail.Content>
		<EntityDetail.SkeletonHeader withActions />
		<EntityDetail.Body>
			<EntityDetail.SkeletonFields columns={2} rows={6} />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Entender cálculo">
				<EntityDetail.SkeletonTitle className="h-32 w-full" />
				<EntityDetail.SkeletonFields columns={2} rows={5} />
			</EntityDetail.Section>
			<EntityDetail.Separator />
			<EntityDetail.Section title="Registro">
				<EntityDetail.SkeletonFields columns={2} rows={3} />
			</EntityDetail.Section>
		</EntityDetail.Body>
		<EntityDetail.Footer />
	</EntityDetail.Content>
);
