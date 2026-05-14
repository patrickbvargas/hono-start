import * as React from "react";
import { AttachmentSection } from "@/features/attachments";
import { EntityActions } from "@/shared/components/entity-actions";
import {
	type DetailFieldItem,
	EntityDetail,
} from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useContract } from "../../hooks/use-data";
import { getContractLifecycleActions } from "../../utils/lifecycle-actions";

interface ContractDetailsProps {
	canManageLifecycle?: boolean;
	id: EntityId;
	onDelete?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
	state: OverlayState;
}

export const ContractDetails = ({
	canManageLifecycle = false,
	id,
	onDelete,
	onEdit,
	onRestore,
	state,
}: ContractDetailsProps) => {
	return (
		<EntityDetail.Root key={id} state={state}>
			<React.Suspense fallback={<ContractDetailsFallback />}>
				<ContractDetailsContent
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

interface ContractDetailsContentProps {
	canManageLifecycle: boolean;
	id: EntityId;
	onDelete?: (id: EntityId) => void;
	onEdit?: (id: EntityId) => void;
	onRestore?: (id: EntityId) => void;
}

const ContractDetailsContent = ({
	canManageLifecycle,
	id,
	onDelete,
	onEdit,
	onRestore,
}: ContractDetailsContentProps) => {
	const { contract } = useContract(id);
	const actions = getContractLifecycleActions({
		canManageLifecycle,
		isSoftDeleted: contract.isSoftDeleted,
		statusValue: contract.statusValue,
	});

	const generalInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "Processo", definition: contract.processNumber },
			{ term: "Cliente", definition: contract.client },
			{ term: "Área", definition: contract.legalArea },
			{ term: "Status do contrato", definition: contract.status },
			{
				term: "% Honorários",
				definition: formatter.percent(contract.feePercentage),
			},
			{
				term: "Bloqueio de status",
				definition: contract.allowStatusChange ? "Desbloqueado" : "Bloqueado",
			},
			{
				term: "Observações",
				definition: contract.notes?.trim() ? contract.notes : "—",
			},
		],
		[contract],
	);

	const assignmentInfo = React.useMemo<DetailFieldItem[]>(
		() =>
			contract.assignments.map((assignment) => ({
				term: assignment.assignmentType,
				definition: assignment.employeeName,
			})),
		[contract],
	);

	const revenueInfo = React.useMemo<DetailFieldItem[]>(
		() =>
			contract.revenues.map((revenue) => ({
				term: revenue.type,
				definition: `${formatter.currency(revenue.totalValue)} • ${revenue.totalInstallments} parcela(s)`,
			})),
		[contract],
	);

	const registerInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Situação",
				definition: (
					<EntityStatus
						isActive={contract.isActive}
						isSoftDeleted={contract.isSoftDeleted}
					/>
				),
			},
			{ term: "Criado em", definition: formatter.date(contract.createdAt) },
			{
				term: "Atualizado em",
				definition: contract.updatedAt
					? formatter.date(contract.updatedAt)
					: "—",
			},
		],
		[contract],
	);

	return (
		<EntityDetail.Content>
			<EntityDetail.Header className="flex-row items-center justify-between gap-3">
				<EntityDetail.Title>{`#${contract.id} • ${contract.processNumber}`}</EntityDetail.Title>
				<EntityActions
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
				<EntityDetail.Section title="Equipe">
					<EntityDetail.Fields items={assignmentInfo} />
				</EntityDetail.Section>
				<EntityDetail.Separator />
				<EntityDetail.Section title="Receitas">
					<EntityDetail.Fields items={revenueInfo} />
				</EntityDetail.Section>
				<EntityDetail.Separator />
				<EntityDetail.Section title="Anexos">
					<AttachmentSection canUpload ownerId={id} ownerKind="contract" />
				</EntityDetail.Section>
				<EntityDetail.Separator />
				<EntityDetail.Section title="Registro">
					<EntityDetail.Fields items={registerInfo} />
				</EntityDetail.Section>
			</EntityDetail.Body>
			<EntityDetail.Footer />
		</EntityDetail.Content>
	);
};

const ContractDetailsFallback = () => (
	<EntityDetail.Content>
		<EntityDetail.Header>
			<EntityDetail.Title>
				<EntityDetail.SkeletonTitle />
			</EntityDetail.Title>
		</EntityDetail.Header>
		<EntityDetail.Body>
			<EntityDetail.SkeletonFields rows={7} />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Equipe">
				<EntityDetail.SkeletonFields rows={2} />
			</EntityDetail.Section>
			<EntityDetail.Separator />
			<EntityDetail.Section title="Receitas">
				<EntityDetail.SkeletonFields rows={2} />
			</EntityDetail.Section>
			<EntityDetail.Separator />
			<EntityDetail.Section title="Anexos">
				<AttachmentSection
					canUpload
					ownerId={idPlaceholder}
					ownerKind="contract"
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
