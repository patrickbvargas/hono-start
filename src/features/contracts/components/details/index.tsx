import { useSuspenseQuery } from "@tanstack/react-query";
import * as React from "react";
import {
	Detail,
	type DetailFieldItem,
} from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import { formatter } from "@/shared/lib/formatter";
import type { OverlayState } from "@/shared/types/overlay";
import { getContractByIdOptions } from "../../api/get";
import type { Contract } from "../../schemas/model";

interface ContractDetailsProps {
	contract: Contract;
	state: OverlayState;
}

export const ContractDetails = ({ contract, state }: ContractDetailsProps) => {
	const { data } = useSuspenseQuery(getContractByIdOptions(contract.id));

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
		<Detail state={state} title={data.processNumber}>
			<Detail.Fields items={generalInfo} />
			<Detail.Separator />
			<Detail.Section title="Equipe">
				<Detail.Fields
					items={
						assignmentInfo.length > 0
							? assignmentInfo
							: [{ term: "Equipe", definition: "Nenhum colaborador informado" }]
					}
				/>
			</Detail.Section>
			<Detail.Separator />
			<Detail.Section title="Receitas">
				<Detail.Fields
					items={
						revenueInfo.length > 0
							? revenueInfo
							: [{ term: "Receitas", definition: "Nenhuma receita informada" }]
					}
				/>
			</Detail.Section>
			<Detail.Separator className="mt-auto" />
			<Detail.Section title="Registro">
				<Detail.Fields items={registerInfo} />
			</Detail.Section>
		</Detail>
	);
};
