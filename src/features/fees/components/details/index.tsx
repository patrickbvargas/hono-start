import { useSearch } from "@tanstack/react-router";
import * as React from "react";
import { AttachmentSectionFallback } from "@/features/attachments";
import { EntityActions } from "@/shared/components/entity-actions";
import { EntityDetail } from "@/shared/components/entity-detail";
import { NavigationLink } from "@/shared/components/navigation-link";
import type { EntityId } from "@/shared/schemas/entity";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import type { OverlayState } from "@/shared/types/overlay";
import { useFee } from "../../hooks/use-data";
import { feeSearchSchema } from "../../schemas/search";
import { getFeeLifecycleActions } from "../../utils/lifecycle-actions";
import { FeeOverview } from "./overview";

interface FeeDetailsProps {
	canManageLifecycle?: boolean;
	id: EntityId;
	onDelete?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
	state: OverlayState;
}

export const FeeDetails = ({
	canManageLifecycle = false,
	id,
	onDelete,
	onEdit,
	onRestore,
	state,
}: FeeDetailsProps) => {
	return (
		<EntityDetail.Root key={id} state={state}>
			<React.Suspense fallback={<FeeDetailsFallback />}>
				<FeeDetailsContent
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

interface FeeDetailsContentProps {
	canManageLifecycle: boolean;
	id: EntityId;
	onDelete?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

const FeeDetailsContent = ({
	canManageLifecycle,
	id,
	onDelete,
	onEdit,
	onRestore,
}: FeeDetailsContentProps) => {
	const currentSearch = useSearch({ strict: false });
	const { fee } = useFee(id);
	const actions = getFeeLifecycleActions({
		canManageLifecycle,
		contractStatusValue: fee.contractStatusValue,
		isSoftDeleted: fee.isSoftDeleted,
	});

	const workspaceLink = (
		<NavigationLink
			to="/honorarios/$feeId"
			params={{ feeId: String(id) }}
			search={{
				tab: "overview",
				returnTo: feeSearchSchema.parse(currentSearch),
			}}
			className="inline-flex items-center gap-1 text-xs font-medium"
		>
			Abrir página
		</NavigationLink>
	);

	return (
		<EntityDetail.Content>
			<EntityDetail.Header className="flex-row items-center justify-between gap-3">
				<EntityDetail.Title className="min-w-0 flex-1 truncate">{`${fee.contractProcessNumber} • ${fee.revenueType}`}</EntityDetail.Title>
				<div className="hidden shrink-0 sm:block">{workspaceLink}</div>
				<EntityActions
					viewPermission={["org:fees:read_all", "org:fees:read_assigned"]}
					editPermission="org:fees:update"
					restorePermission="org:fees:restore"
					deletePermission="org:fees:delete"
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
				<FeeOverview id={id} />
			</EntityDetail.Body>
			<EntityDetail.Footer />
		</EntityDetail.Content>
	);
};

const FeeDetailsFallback = () => {
	const session = useLoggedUserSession();
	return (
		<EntityDetail.Content>
			<EntityDetail.SkeletonHeader withActions withPageLink />
			<EntityDetail.Body>
				<EntityDetail.SkeletonPageLink />
				<EntityDetail.SkeletonFields columns={2} rows={6} />
				<EntityDetail.Separator />
				<EntityDetail.Section title="Remuneração">
					<EntityDetail.SkeletonFields columns={2} rows={2} />
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
					<EntityDetail.SkeletonFields columns={2} rows={2} />
				</EntityDetail.Section>
			</EntityDetail.Body>
			<EntityDetail.Footer />
		</EntityDetail.Content>
	);
};
