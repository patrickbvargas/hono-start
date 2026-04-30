import * as React from "react";
import {
	type DetailFieldItem,
	EntityDetail,
} from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useContract } from "../../hooks/use-data";

interface ContractDetailsProps {
	id: EntityId;
	state: OverlayState;
}

export const ContractDetails = ({ id, state }: ContractDetailsProps) => {
	return (
		<EntityDetail.Root key={id} state={state}>
			<React.Suspense fallback={<ContractDetailsFallback />}>
				<ContractDetailsContent id={id} />
			</React.Suspense>
		</EntityDetail.Root>
	);
};

const ContractDetailsContent = ({ id }: { id: EntityId }) => {
	const { contract } = useContract(id);

	const generalInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "Processo", definition: contract.processNumber },
			{ term: "Cliente", definition: contract.client },
			{ term: "Área jurídica", definition: contract.legalArea },
			{ term: "Status do contrato", definition: contract.status },
			{
				term: "Percentual",
				definition: formatter.percent(contract.feePercentage),
			},
			{
				term: "Bloqueio de status",
				definition: contract.allowStatusChange ? "Desbloqueado" : "Bloqueado",
			},
		],
		[contract],
	);

	const assignmentInfo = React.useMemo<DetailFieldItem[]>(
		() =>
			contract.assignments.map((assignment) => ({
				term: assignment.assignmentType,
				definition: `${assignment.employeeName} • ${assignment.employeeType}`,
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
				term: "Observações",
				definition: contract.notes?.trim() ? contract.notes : "—",
			},
		],
		[contract],
	);

	return (
		<EntityDetail.Content>
			<EntityDetail.Header>
				<EntityDetail.Title>{contract.processNumber}</EntityDetail.Title>
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
			<EntityDetail.SkeletonFields rows={6} />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Equipe">
				<EntityDetail.SkeletonFields rows={2} />
			</EntityDetail.Section>
			<EntityDetail.Separator />
			<EntityDetail.Section title="Receitas">
				<EntityDetail.SkeletonFields rows={2} />
			</EntityDetail.Section>
			<EntityDetail.Separator />
			<EntityDetail.Section title="Registro">
				<EntityDetail.SkeletonFields rows={3} />
			</EntityDetail.Section>
		</EntityDetail.Body>
		<EntityDetail.Footer />
	</EntityDetail.Content>
);
