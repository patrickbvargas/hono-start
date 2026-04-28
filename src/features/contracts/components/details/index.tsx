import * as React from "react";
import { AttachmentSection } from "@/features/attachments";
import {
	type DetailFieldItem,
	EntityDetail,
} from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import { isContractReadOnly } from "@/shared/session";
import type { OverlayState } from "@/shared/types/overlay";
import { useContract } from "../../hooks/use-data";

interface ContractDetailsProps {
	id: EntityId;
	state: OverlayState;
}

export const ContractDetails = ({ id, state }: ContractDetailsProps) => {
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
		<EntityDetail state={state} title={contract.processNumber}>
			<EntityDetail.Fields items={generalInfo} />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Equipe">
				<EntityDetail.Fields items={assignmentInfo} />
			</EntityDetail.Section>
			<EntityDetail.Separator />
			<EntityDetail.Section title="Receitas">
				<EntityDetail.Fields items={revenueInfo} />
			</EntityDetail.Section>
			<EntityDetail.Separator className="mt-auto" />
			<AttachmentSection
				ownerId={contract.id}
				ownerKind="contract"
				canUpload={
					!contract.isSoftDeleted &&
					contract.isAssignedToActor &&
					!isContractReadOnly({
						firmId: 0,
						statusValue: contract.statusValue,
					})
				}
			/>
			<EntityDetail.Separator />
			<EntityDetail.Section title="Registro">
				<EntityDetail.Fields items={registerInfo} />
			</EntityDetail.Section>
		</EntityDetail>
	);
};
