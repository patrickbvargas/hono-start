import { useSearch } from "@tanstack/react-router";
import * as React from "react";
import { AttachmentSectionFallback } from "@/features/attachments";
import { EntityActions } from "@/shared/components/entity-actions";
import { EntityDetail } from "@/shared/components/entity-detail";
import { NavigationLink } from "@/shared/components/navigation-link";
import type { EntityId } from "@/shared/schemas/entity";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import type { OverlayState } from "@/shared/types/overlay";
import { useEmployee } from "../../hooks/use-data";
import { employeeSearchSchema } from "../../schemas/search";
import { getEmployeeLifecycleActions } from "../../utils/lifecycle-actions";
import { EmployeeOverview } from "./overview";

interface EmployeeDetailsProps {
	canManageLifecycle?: boolean;
	id: EntityId;
	onDelete?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
	state: OverlayState;
}

export const EmployeeDetails = ({
	canManageLifecycle = false,
	id,
	onDelete,
	onEdit,
	onRestore,
	state,
}: EmployeeDetailsProps) => {
	return (
		<EntityDetail.Root key={id} state={state}>
			<React.Suspense fallback={<EmployeeDetailsFallback id={id} />}>
				<EmployeeDetailsContent
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

interface EmployeeDetailsContentProps {
	canManageLifecycle: boolean;
	id: EntityId;
	onDelete?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

const EmployeeDetailsContent = ({
	canManageLifecycle,
	id,
	onDelete,
	onEdit,
	onRestore,
}: EmployeeDetailsContentProps) => {
	const currentSearch = useSearch({ strict: false });
	const { employee } = useEmployee(id);
	const actions = getEmployeeLifecycleActions({
		canManageLifecycle,
		isSoftDeleted: employee.isSoftDeleted,
	});

	const workspaceLink = (
		<NavigationLink
			to="/colaboradores/$employeeId"
			params={{ employeeId: String(id) }}
			search={{
				tab: "overview",
				returnTo: employeeSearchSchema.parse(currentSearch),
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
					{employee.fullName}
				</EntityDetail.Title>
				<div className="hidden shrink-0 sm:block">{workspaceLink}</div>
				<EntityActions
					viewPermission="org:employees:read"
					editPermission="org:employees:update"
					restorePermission="org:employees:restore"
					deletePermission="org:employees:delete"
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
				<EmployeeOverview id={id} />
			</EntityDetail.Body>
			<EntityDetail.Footer />
		</EntityDetail.Content>
	);
};

const EmployeeDetailsFallback = ({ id }: { id: EntityId }) => {
	const session = useLoggedUserSession();
	return (
		<EntityDetail.Content>
			<EntityDetail.SkeletonHeader withActions withPageLink />
			<EntityDetail.Body>
				<EntityDetail.SkeletonPageLink />
				<EntityDetail.SkeletonFields columns={2} rows={3} />
				<EntityDetail.Separator />
				<EntityDetail.Section title="Financeiro">
					<EntityDetail.SkeletonFields columns={2} rows={2} />
					{(hasPermission(session, "org:remunerations:read_all") ||
						(hasPermission(session, "org:remunerations:read_own") &&
							session.employee.id === id)) && (
						<EntityDetail.SkeletonTitle className="mt-3 h-5 w-36" />
					)}
				</EntityDetail.Section>
				{hasPermission(session, "org:attachments:read") && (
					<>
						<EntityDetail.Separator />
						<AttachmentSectionFallback
							canUpload={
								hasPermission(session, "org:attachments:upload") &&
								hasPermission(session, "org:employees:update")
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
