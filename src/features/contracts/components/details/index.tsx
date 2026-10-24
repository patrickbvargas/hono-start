import * as React from "react";
import {
	AttachmentSection,
	AttachmentSectionFallback,
} from "@/features/attachments";
import { FeeForm, feeSearchDefaults } from "@/features/fees";
import { RelatedRecordLink } from "@/features/related-records";
import { EntityActions } from "@/shared/components/entity-actions";
import {
	type DetailFieldItem,
	EntityDetail,
} from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import { NavigationLink } from "@/shared/components/navigation-link";
import { Button } from "@/shared/components/ui";
import { useOverlay } from "@/shared/hooks/use-overlay";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import type { OverlayState } from "@/shared/types/overlay";
import { useContract } from "../../hooks/use-data";
import { getContractLifecycleActions } from "../../utils/lifecycle-actions";
import { RevenuePaymentStatus } from "./payment-status";

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
	const session = useLoggedUserSession();
	const canReadFees =
		hasPermission(session, "org:fees:read_all") ||
		(hasPermission(session, "org:fees:read_assigned") &&
			contract.assignments.some(
				(assignment) =>
					assignment.isActive &&
					!assignment.isSoftDeleted &&
					assignment.employeeId === session.employee.id &&
					["RESPONSIBLE", "RECOMMENDED", "ADMIN_ASSISTANT"].includes(
						assignment.assignmentTypeValue,
					),
			));
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
				term: "% Honorários",
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
			{
				term: "Cadastro",
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
				<EntityDetail.Title>{contract.processNumber}</EntityDetail.Title>
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
				<EntityDetail.Fields columns={2} items={generalInfo} />
				<EntityDetail.Separator />
				<EntityDetail.Section title="Equipe">
					<EntityDetail.Fields columns={2} items={assignmentInfo} />
				</EntityDetail.Section>
				<EntityDetail.Separator />
				<EntityDetail.Section title="Receitas">
					{contract.revenues
						.filter((revenue) => revenue.isActive && !revenue.isSoftDeleted)
						.map((revenue) => (
							<div key={revenue.id} className="space-y-3 rounded-lg border p-3">
								<div className="flex items-center justify-between gap-3">
									<h3 className="font-medium">{revenue.type}</h3>
									<RevenuePaymentStatus
										isFullyPaid={revenue.isFullyPaid}
										paidValue={revenue.paidValue}
										nextDueDate={revenue.nextDueDate}
									/>
								</div>
								<EntityDetail.Fields
									columns={2}
									items={[
										{
											term: "Valor contratado",
											definition: formatter.currency(revenue.totalValue),
										},
										{
											term: "Recebido (inclui entrada)",
											definition: formatter.currency(revenue.paidValue),
										},
										{
											term: "A receber",
											definition: formatter.currency(revenue.remainingValue),
										},
										{
											term: "Parcelas registradas",
											definition: `${revenue.installmentsPaid} de ${revenue.totalInstallments}`,
										},
										{
											term: "Próximo vencimento em aberto",
											definition:
												revenue.isFullyPaid || !revenue.nextDueDate
													? "—"
													: formatter.calendarDate(revenue.nextDueDate),
										},
									]}
								/>
								{hasPermission(session, "org:fees:create") &&
								canReadFees &&
								contract.isActive &&
								!contract.isSoftDeleted &&
								contract.statusValue === "ACTIVE" &&
								!revenue.isFullyPaid &&
								revenue.nextInstallmentNumber !== null ? (
									<Button
										size="sm"
										onClick={() => {
											setSelectedRevenue(revenue.id);
											feeOverlay.overlay.create.open();
										}}
									>
										Registrar honorário
									</Button>
								) : null}
								{canReadFees ? (
									<NavigationLink
										to="/honorarios"
										state={{ resetFilterPanel: true }}
										aria-label={`Ver honorários da receita ${revenue.type}`}
										search={{
											...feeSearchDefaults,
											contractId: String(id),
											revenueId: String(revenue.id),
										}}
										className="inline-flex p-2 text-sm underline underline-offset-4"
									>
										Honorários
									</NavigationLink>
								) : null}
							</div>
						))}
				</EntityDetail.Section>
				<EntityDetail.Separator />
				<AttachmentSection canUpload ownerId={id} ownerKind="contract" />
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

const ContractDetailsFallback = () => (
	<EntityDetail.Content>
		<EntityDetail.SkeletonHeader withActions />
		<EntityDetail.Body>
			<EntityDetail.SkeletonFields columns={2} rows={6} />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Equipe">
				<EntityDetail.SkeletonFields columns={2} rows={2} />
			</EntityDetail.Section>
			<EntityDetail.Separator />
			<EntityDetail.Section title="Receitas">
				<div className="rounded-lg border p-3 space-y-4">
					<EntityDetail.SkeletonTitle />
					<EntityDetail.SkeletonFields columns={2} rows={5} />
					<div className="flex gap-2">
						<EntityDetail.SkeletonTitle className="h-8 w-32" />
						<EntityDetail.SkeletonTitle className="h-8 w-28" />
					</div>
				</div>
			</EntityDetail.Section>
			<EntityDetail.Separator />
			<AttachmentSectionFallback canUpload />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Registro">
				<EntityDetail.SkeletonFields columns={2} rows={3} />
			</EntityDetail.Section>
		</EntityDetail.Body>
		<EntityDetail.Footer />
	</EntityDetail.Content>
);
