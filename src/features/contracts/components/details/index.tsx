import { useSearch } from "@tanstack/react-router";
import * as React from "react";
import {
	AttachmentSection,
	AttachmentSectionFallback,
} from "@/features/attachments";
import { FeeForm } from "@/features/fees";
import { RelatedRecordLink } from "@/features/related-records";
import { EntityActions } from "@/shared/components/entity-actions";
import {
	type DetailFieldItem,
	EntityDetail,
} from "@/shared/components/entity-detail";
import { NavigationLink } from "@/shared/components/navigation-link";
import { useOverlay } from "@/shared/hooks/use-overlay";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import type { OverlayState } from "@/shared/types/overlay";
import { useContract } from "../../hooks/use-data";
import { contractSearchSchema } from "../../schemas/search";
import { getContractLifecycleActions } from "../../utils/lifecycle-actions";
import { canReadContractReceipts } from "../../utils/workflow-access";
import { ContractRevenues } from "./revenues";

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
	const currentSearch = useSearch({ strict: false });
	const session = useLoggedUserSession();
	const canReadFees = canReadContractReceipts(session, contract);
	const feeOverlay = useOverlay<EntityId>();
	const [selectedRevenue, setSelectedRevenue] = React.useState<number | null>(
		null,
	);
	const actions = getContractLifecycleActions({
		canManageLifecycle,
		isSoftDeleted: contract.isSoftDeleted,
		statusValue: contract.statusValue,
	});

	const generalInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Cliente",
				definition: hasPermission(session, "org:clients:read") ? (
					<RelatedRecordLink kind="client" id={contract.clientId}>
						{contract.client}
					</RelatedRecordLink>
				) : (
					contract.client
				),
			},
			{ term: "Área", definition: contract.legalArea },
			{ term: "Andamento", definition: contract.status },
			{
				term: "Honorários (%)",
				definition: formatter.percent(contract.feePercentage),
			},
			{
				term: "Alteração de status",
				definition: contract.allowStatusChange ? "Permitida" : "Bloqueada",
			},
			{
				term: "Observações",
				definition: contract.notes?.trim() ? contract.notes : "—",
			},
		],
		[contract, session],
	);

	const assignmentInfo = React.useMemo<DetailFieldItem[]>(
		() =>
			contract.assignments.map((assignment) => ({
				term: assignment.assignmentType,
				definition: hasPermission(session, "org:employees:read") ? (
					<RelatedRecordLink kind="employee" id={assignment.employeeId}>
						{assignment.employeeName}
					</RelatedRecordLink>
				) : (
					assignment.employeeName
				),
			})),
		[contract, session],
	);

	const registerInfo = React.useMemo<DetailFieldItem[]>(
		() => [
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

	const workspaceLink = (
		<NavigationLink
			to="/contratos/$contractId"
			params={{ contractId: String(id) }}
			search={{
				tab: "overview",
				returnTo: contractSearchSchema.parse(currentSearch),
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
					{contract.processNumber}
				</EntityDetail.Title>
				<div className="hidden shrink-0 sm:block">{workspaceLink}</div>
				<EntityActions
					viewPermission={[
						"org:contracts:read_all",
						"org:contracts:read_assigned",
					]}
					editPermission={[
						"org:contracts:update_all",
						"org:contracts:update_assigned",
					]}
					restorePermission="org:contracts:restore"
					deletePermission="org:contracts:delete"
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
				<EntityDetail.Fields columns={2} items={generalInfo} />
				<EntityDetail.Separator />
				<EntityDetail.Section title="Equipe">
					<EntityDetail.Fields columns={2} items={assignmentInfo} />
				</EntityDetail.Section>
				<EntityDetail.Separator />
				<EntityDetail.Section title="Receitas">
					<ContractRevenues
						contract={contract}
						canReadFees={canReadFees}
						onRegister={(revenueId) => {
							setSelectedRevenue(revenueId);
							feeOverlay.overlay.create.open();
						}}
					/>
				</EntityDetail.Section>
				<EntityDetail.Separator />
				{hasPermission(session, "org:attachments:read") && (
					<AttachmentSection
						canUpload={
							!contract.isSoftDeleted &&
							!["COMPLETED", "CANCELLED"].includes(contract.statusValue) &&
							(hasPermission(session, "org:contracts:update_all") ||
								(hasPermission(session, "org:contracts:update_assigned") &&
									contract.isAssignedToActor))
						}
						ownerId={id}
						ownerKind="contract"
					/>
				)}
				<EntityDetail.Separator />
				<EntityDetail.Section title="Registro">
					<EntityDetail.Fields columns={2} items={registerInfo} />
				</EntityDetail.Section>
			</EntityDetail.Body>
			<EntityDetail.Footer />
			{feeOverlay.overlay.create.render((state) => (
				<FeeForm
					state={state}
					initialSelection={{
						contractId: String(id),
						revenueId: String(selectedRevenue),
						installmentNumber:
							contract.revenues.find(
								(revenue) => revenue.id === selectedRevenue,
							)?.nextInstallmentNumber ?? 1,
					}}
					onSuccess={state.close}
				/>
			))}
		</EntityDetail.Content>
	);
};

const ContractDetailsFallback = () => {
	const session = useLoggedUserSession();
	return (
		<EntityDetail.Content>
			<EntityDetail.SkeletonHeader withActions withPageLink />
			<EntityDetail.Body>
				<EntityDetail.SkeletonPageLink />
				<EntityDetail.SkeletonFields columns={2} rows={6} />
				<EntityDetail.Separator />
				<EntityDetail.Section title="Equipe">
					<EntityDetail.SkeletonFields columns={2} rows={2} />
				</EntityDetail.Section>
				<EntityDetail.Separator />
				<EntityDetail.Section title="Receitas">
					<div className="space-y-3 rounded-lg border p-3">
						<div className="flex items-center justify-between gap-3">
							<EntityDetail.SkeletonTitle />
							<EntityDetail.SkeletonTitle className="h-5 w-16" />
						</div>
						<EntityDetail.SkeletonFields columns={2} rows={6} />
						<div className="flex items-center gap-1">
							<EntityDetail.SkeletonTitle className="h-8 w-44" />
							<EntityDetail.SkeletonTitle className="h-9 w-32" />
						</div>
					</div>
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
