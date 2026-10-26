import * as React from "react";
import { AttachmentSection } from "@/features/attachments";
import { contractSearchDefaults } from "@/features/contracts";
import { remunerationSearchDefaults } from "@/features/remunerations";
import {
	type DetailFieldItem,
	EntityDetail,
} from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import { FormSection } from "@/shared/components/form-section";
import { NavigationLink } from "@/shared/components/navigation-link";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import { hasPermission, useLoggedUserSession } from "@/shared/session";
import { useEmployee } from "../../hooks/use-data";

interface EmployeeOverviewProps {
	section?: "all" | "overview" | "finance";
	id: EntityId;
	includeAttachments?: boolean;
}
export function EmployeeOverview({
	id,
	includeAttachments = true,
	section = "all",
}: EmployeeOverviewProps) {
	const { employee } = useEmployee(id);
	const session = useLoggedUserSession();
	const remunerationLink =
		hasPermission(session, "org:remunerations:read_all") ||
		(hasPermission(session, "org:remunerations:read_own") &&
			session.employee.id === id) ? (
			<NavigationLink
				to="/remuneracoes"
				state={{ resetFilterPanel: true }}
				search={{ ...remunerationSearchDefaults, employeeId: String(id) }}
				aria-label={`Ver remunerações de ${employee.fullName}`}
			>
				Ver remunerações
			</NavigationLink>
		) : null;

	const generalInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "OAB", definition: formatter.oab(employee.oabNumber) },
			{ term: "Função", definition: employee.type },
			{
				term: "Contratos",
				definition:
					hasPermission(session, "org:contracts:read_all") ||
					hasPermission(session, "org:contracts:read_assigned") ? (
						<NavigationLink
							to="/contratos"
							state={{ resetFilterPanel: true }}
							aria-label={`Ver contratos de ${employee.fullName}`}
							search={{
								...contractSearchDefaults,
								employeeId: String(id),
								active: "all",
								status: "all",
							}}
						>
							{employee.contractCount}
						</NavigationLink>
					) : (
						employee.contractCount
					),
			},
		],
		[employee, id, session],
	);

	const financialInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "% Remuneração",
				definition: formatter.percent(employee.remunerationPercent),
			},
			{
				term: "% Indicação",
				definition: formatter.percent(employee.referrerPercent),
			},
		],
		[employee],
	);

	const registerInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Situação",
				definition: (
					<EntityStatus
						isActive={employee.isActive}
						isSoftDeleted={employee.isSoftDeleted}
					/>
				),
			},
			{ term: "Criado em", definition: formatter.date(employee.createdAt) },
			{
				term: "Atualizado em",
				definition: employee.updatedAt
					? formatter.date(employee.updatedAt)
					: "—",
			},
		],
		[employee],
	);

	if (section === "overview") {
		return (
			<FormSection title="Dados do colaborador">
				<EntityDetail.Fields columns={2} items={generalInfo} />
			</FormSection>
		);
	}
	if (section === "finance") {
		return (
			<FormSection title="Percentuais de remuneração">
				<EntityDetail.Fields columns={2} items={financialInfo} />
				{remunerationLink && (
					<div className="mt-3 text-sm">{remunerationLink}</div>
				)}
			</FormSection>
		);
	}

	return (
		<div className="flex min-w-0 flex-col gap-3">
			<EntityDetail.Fields columns={2} items={generalInfo} />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Financeiro">
				<EntityDetail.Fields columns={2} items={financialInfo} />
				{remunerationLink && (
					<div className="mt-3 text-sm">{remunerationLink}</div>
				)}
			</EntityDetail.Section>
			{includeAttachments && (
				<>
					<EntityDetail.Separator />
					<AttachmentSection canUpload ownerId={id} ownerKind="employee" />
				</>
			)}
			<EntityDetail.Separator />
			<EntityDetail.Section title="Registro">
				<EntityDetail.Fields columns={2} items={registerInfo} />
			</EntityDetail.Section>
		</div>
	);
}
