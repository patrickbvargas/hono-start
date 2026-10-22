import * as React from "react";
import { AttachmentSection } from "@/features/attachments";
import { EntityActions } from "@/shared/components/entity-actions";
import {
	type DetailFieldItem,
	EntityDetail,
} from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import { Button, DrawerClose } from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";

import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useEmployee } from "../../hooks/use-data";
import { getEmployeeLifecycleActions } from "../../utils/lifecycle-actions";

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
			<React.Suspense fallback={<EmployeeDetailsFallback />}>
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
	const { employee } = useEmployee(id);
	const actions = getEmployeeLifecycleActions({
		canManageLifecycle,
		isSoftDeleted: employee.isSoftDeleted,
	});

	const generalInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "OAB", definition: formatter.oab(employee.oabNumber) },
			{ term: "Função", definition: employee.type },
			{ term: "Contratos", definition: employee.contractCount },
		],
		[employee],
	);

	const financialInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "% Remuneração",
				definition: formatter.percent(employee.remunerationPercent),
			},
			{
				term: "% Indicação",
				definition: formatter.percent(employee.referrerPercent),
			},
		],
		[employee],
	);

	const registerInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Situação",
				definition: (
					<EntityStatus
						isActive={employee.isActive}
						isSoftDeleted={employee.isSoftDeleted}
					/>
				),
			},
			{ term: "Criado em", definition: formatter.date(employee.createdAt) },
			{
				term: "Atualizado em",
				definition: employee.updatedAt
					? formatter.date(employee.updatedAt)
					: "—",
			},
		],
		[employee],
	);

	return (
		<EntityDetail.Content>
			<EntityDetail.Header className="flex-row items-center justify-between gap-3">
				<EntityDetail.Title>{employee.fullName}</EntityDetail.Title>
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
				<EntityDetail.Fields items={generalInfo} />
				<EntityDetail.Separator />
				<EntityDetail.Section title="Financeiro">
					<EntityDetail.Fields items={financialInfo} />
				</EntityDetail.Section>
				<EntityDetail.Separator />
				<EntityDetail.Section title="Anexos">
					<AttachmentSection canUpload ownerId={id} ownerKind="employee" />
				</EntityDetail.Section>
				<EntityDetail.Separator />
				<EntityDetail.Section title="Registro">
					<EntityDetail.Fields items={registerInfo} />
				</EntityDetail.Section>
			</EntityDetail.Body>
			<EntityDetail.Footer>
				<div className="flex w-full flex-col gap-2">
					<DrawerClose
						render={
							<Button type="button" variant="outline" className="w-full" />
						}
					>
						Fechar
					</DrawerClose>
				</div>
			</EntityDetail.Footer>
		</EntityDetail.Content>
	);
};

const EmployeeDetailsFallback = () => (
	<EntityDetail.Content>
		<EntityDetail.Header>
			<EntityDetail.Title>
				<EntityDetail.SkeletonTitle />
			</EntityDetail.Title>
		</EntityDetail.Header>
		<EntityDetail.Body>
			<EntityDetail.SkeletonFields rows={4} />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Financeiro">
				<EntityDetail.SkeletonFields rows={2} />
			</EntityDetail.Section>
			<EntityDetail.Separator />
			<EntityDetail.Section title="Anexos">
				<AttachmentSection
					canUpload
					ownerId={idPlaceholder}
					ownerKind="employee"
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
