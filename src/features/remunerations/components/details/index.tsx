import * as React from "react";
import { clientSearchDefaults } from "@/features/clients";
import { contractSearchDefaults } from "@/features/contracts";
import { employeeSearchDefaults } from "@/features/employees";
import { feeSearchDefaults } from "@/features/fees";
import { EntityActions } from "@/shared/components/entity-actions";
import {
	type DetailFieldItem,
	EntityDetail,
} from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import { NavigationLink } from "@/shared/components/navigation-link";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
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
	const session = useLoggedUserSession();
	const actions = getRemunerationLifecycleActions({
		canManageLifecycle,
		isSoftDeleted: remuneration.isSoftDeleted,
	});

	const summaryInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Colaborador",
				definition: hasPermission(session, "org:employees:read") ? (
					<NavigationLink
						to="/colaboradores"
						search={{
							...employeeSearchDefaults,
							query: remuneration.employeeName,
						}}
					>
						{remuneration.employeeName}
					</NavigationLink>
				) : (
					remuneration.employeeName
				),
			},
			{
				term: "Processo",
				definition:
					hasPermission(session, "org:contracts:read_all") ||
					hasPermission(session, "org:contracts:read_assigned") ? (
						<NavigationLink
							to="/contratos"
							search={{
								...contractSearchDefaults,
								query: remuneration.contractProcessNumber,
							}}
						>
							{remuneration.contractProcessNumber}
						</NavigationLink>
					) : (
						remuneration.contractProcessNumber
					),
			},
			{
				term: "Cliente",
				definition: hasPermission(session, "org:clients:read") ? (
					<NavigationLink
						to="/clientes"
						search={{ ...clientSearchDefaults, query: remuneration.client }}
					>
						{remuneration.client}
					</NavigationLink>
				) : (
					remuneration.client
				),
			},
			{
				term: "Data do honorário",
				definition: formatter.calendarDate(remuneration.paymentDate),
			},
			{ term: "Valor", definition: formatter.currency(remuneration.amount) },
			{
				term: "% Efetivo",
				definition: formatter.percent(remuneration.effectivePercentage),
			},
		],
		[remuneration, session],
	);

	const sourceInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Honorário",
				definition:
					hasPermission(session, "org:fees:read_all") ||
					hasPermission(session, "org:fees:read_assigned") ? (
						<NavigationLink
							to="/honorarios"
							search={{
								...feeSearchDefaults,
								contractId: String(remuneration.contractId),
							}}
						>
							Honorário #{remuneration.feeId} · parcela{" "}
							{remuneration.feeInstallmentNumber}
						</NavigationLink>
					) : (
						String(remuneration.feeId)
					),
			},
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
		[remuneration, session],
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
				<EntityDetail.Fields columns={2} items={summaryInfo} />
				<EntityDetail.Separator />
				<EntityDetail.Section title="Origem">
					<EntityDetail.Fields columns={2} items={sourceInfo} />
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

const RemunerationDetailsFallback = () => (
	<EntityDetail.Content>
		<EntityDetail.SkeletonHeader withActions />
		<EntityDetail.Body>
			<EntityDetail.SkeletonFields columns={2} rows={6} />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Origem">
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
