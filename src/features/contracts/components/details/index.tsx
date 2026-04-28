import { useSuspenseQuery } from "@tanstack/react-query";
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
import { getContractByIdQueryOptions } from "../../api/queries";

interface ContractDetailsProps {
	id: EntityId;
	state: OverlayState;
}

export const ContractDetails = ({ id, state }: ContractDetailsProps) => {
	const { data } = useSuspenseQuery(getContractByIdQueryOptions(id));

	const generalInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "Processo", definition: data.processNumber },
			{ term: "Cliente", definition: data.client },
			{ term: "Área jurídica", definition: data.legalArea },
			{ term: "Status do contrato", definition: data.status },
			{
				term: "Percentual",
				definition: formatter.percent(data.feePercentage),
			},
			{
				term: "Bloqueio de status",
				definition: data.allowStatusChange ? "Desbloqueado" : "Bloqueado",
			},
		],
		[data],
	);

	const assignmentInfo = React.useMemo<DetailFieldItem[]>(
		() =>
			data.assignments.map((assignment) => ({
				term: assignment.assignmentType,
				definition: `${assignment.employeeName} • ${assignment.employeeType}`,
			})),
		[data],
	);

	const revenueInfo = React.useMemo<DetailFieldItem[]>(
		() =>
			data.revenues.map((revenue) => ({
				term: revenue.type,
				definition: `${formatter.currency(revenue.totalValue)} • ${revenue.totalInstallments} parcela(s)`,
			})),
		[data],
	);

	const registerInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Situação",
				definition: (
					<EntityStatus
						isActive={data.isActive}
						isSoftDeleted={data.isSoftDeleted}
					/>
				),
			},
			{ term: "Criado em", definition: formatter.date(data.createdAt) },
			{
				term: "Observações",
				definition: data.notes?.trim() ? data.notes : "—",
			},
		],
		[data],
	);

	return (
		<EntityDetail state={state} title={data.processNumber}>
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
				ownerId={data.id}
				ownerKind="contract"
				canUpload={
					!data.isSoftDeleted &&
					data.isAssignedToActor &&
					!isContractReadOnly({
						firmId: 0,
						statusValue: data.statusValue,
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
