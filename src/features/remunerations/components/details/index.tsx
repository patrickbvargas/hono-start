import * as React from "react";
import { EntityActions } from "@/shared/components/entity-actions";
import {
	type DetailFieldItem,
	EntityDetail,
} from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useRemuneration } from "../../hooks/use-data";
import { getRemunerationLifecycleActions } from "../../utils/lifecycle-actions";

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

	const summaryInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "Colaborador", definition: remuneration.employeeName },
			{ term: "Processo", definition: remuneration.contractProcessNumber },
			{ term: "Cliente", definition: remuneration.client },
			{
				term: "Competência",
				definition: formatter.date(remuneration.paymentDate),
			},
			{ term: "Valor", definition: formatter.currency(remuneration.amount) },
			{
				term: "% Efetivo",
				definition: formatter.percent(remuneration.effectivePercentage),
			},
		],
		[remuneration],
	);

	const sourceInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "Honorário", definition: String(remuneration.feeId) },
			{
				term: "Nº da parcela",
				definition: String(remuneration.feeInstallmentNumber),
			},
			{
				term: "Valor do honorário",
				definition: formatter.currency(remuneration.feeAmount),
			},
			{
				term: "Origem",
				definition: remuneration.isManualOverride
					? "Ajuste manual"
					: "Gerada automaticamente",
			},
			{
				term: "Situação do honorário",
				definition: remuneration.parentFeeIsSoftDeleted ? "Excluído" : "Ativo",
			},
		],
		[remuneration],
	);

	const registerInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Situação",
				definition: (
					<EntityStatus
						isActive={remuneration.isActive}
						isSoftDeleted={remuneration.isSoftDeleted}
					/>
				),
			},
			{ term: "Criado em", definition: formatter.date(remuneration.createdAt) },
			{
				term: "Atualizado em",
				definition: formatter.date(remuneration.updatedAt),
			},
		],
		[remuneration],
	);

	return (
		<EntityDetail.Content>
			<EntityDetail.Header className="flex-row items-center justify-between gap-3">
				<EntityDetail.Title>
					{`#${remuneration.id} • ${remuneration.employeeName} • ${remuneration.contractProcessNumber}`}
				</EntityDetail.Title>
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
				<EntityDetail.Fields items={summaryInfo} />
				<EntityDetail.Separator />
				<EntityDetail.Section title="Origem">
					<EntityDetail.Fields items={sourceInfo} />
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

const RemunerationDetailsFallback = () => (
	<EntityDetail.Content>
		<EntityDetail.Header>
			<EntityDetail.Title>
				<EntityDetail.SkeletonTitle />
			</EntityDetail.Title>
		</EntityDetail.Header>
		<EntityDetail.Body>
			<EntityDetail.SkeletonFields rows={6} />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Origem">
				<EntityDetail.SkeletonFields rows={5} />
			</EntityDetail.Section>
			<EntityDetail.Separator />
			<EntityDetail.Section title="Registro">
				<EntityDetail.SkeletonFields rows={3} />
			</EntityDetail.Section>
		</EntityDetail.Body>
		<EntityDetail.Footer />
	</EntityDetail.Content>
);
