import * as React from "react";
import { RelatedRecordLink } from "@/features/related-records";
import { EntityActions } from "@/shared/components/entity-actions";
import {
	type DetailFieldItem,
	EntityDetail,
} from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import type { OverlayState } from "@/shared/types/overlay";
import { useFee } from "../../hooks/use-data";
import { getFeeLifecycleActions } from "../../utils/lifecycle-actions";

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
	const { fee } = useFee(id);
	const session = useLoggedUserSession();
	const actions = getFeeLifecycleActions({
		canManageLifecycle,
		contractStatusValue: fee.contractStatusValue,
		isSoftDeleted: fee.isSoftDeleted,
	});

	const generalInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Processo",
				definition:
					hasPermission(session, "org:contracts:read_all") ||
					hasPermission(session, "org:contracts:read_assigned") ? (
						<RelatedRecordLink kind="contract" id={fee.contractId}>
							{fee.contractProcessNumber}
						</RelatedRecordLink>
					) : (
						fee.contractProcessNumber
					),
			},
			{
				term: "Cliente",
				definition: hasPermission(session, "org:clients:read") ? (
					<RelatedRecordLink kind="client" id={fee.clientId}>
						{fee.client}
					</RelatedRecordLink>
				) : (
					fee.client
				),
			},
			{ term: "Tipo de honorário", definition: fee.revenueType },
			{
				term: "Data de recebimento",
				definition: formatter.calendarDate(fee.paymentDate),
			},
			{ term: "Valor", definition: formatter.currency(fee.amount) },
			{ term: "Nº da parcela", definition: String(fee.installmentNumber) },
		],
		[fee, session],
	);

	const remunerationInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Remuneração automática",
				definition: fee.generatesRemuneration ? "Sim" : "Não",
			},
			{
				term: "Remunerações vinculadas",
				definition: String(fee.remunerationCount),
			},
		],
		[fee],
	);

	const registerInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Situação",
				definition: (
					<EntityStatus
						isActive={fee.isActive}
						isSoftDeleted={fee.isSoftDeleted}
					/>
				),
			},
			{ term: "Criado em", definition: formatter.date(fee.createdAt) },
			{
				term: "Atualizado em",
				definition: fee.updatedAt ? formatter.date(fee.updatedAt) : "—",
			},
		],
		[fee],
	);

	return (
		<EntityDetail.Content>
			<EntityDetail.Header className="flex-row items-center justify-between gap-3">
				<EntityDetail.Title>
					{`${fee.contractProcessNumber} • ${fee.revenueType}`}
				</EntityDetail.Title>
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
				<EntityDetail.Fields columns={2} items={generalInfo} />
				<EntityDetail.Separator />
				<EntityDetail.Section title="Remuneração">
					<EntityDetail.Fields columns={2} items={remunerationInfo} />
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

const FeeDetailsFallback = () => (
	<EntityDetail.Content>
		<EntityDetail.SkeletonHeader withActions />
		<EntityDetail.Body>
			<EntityDetail.SkeletonFields columns={2} rows={6} />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Remuneração">
				<EntityDetail.SkeletonFields columns={2} rows={2} />
			</EntityDetail.Section>
			<EntityDetail.Separator />
			<EntityDetail.Section title="Registro">
				<EntityDetail.SkeletonFields columns={2} rows={3} />
			</EntityDetail.Section>
		</EntityDetail.Body>
		<EntityDetail.Footer />
	</EntityDetail.Content>
);
