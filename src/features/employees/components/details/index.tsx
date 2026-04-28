import * as React from "react";
import { AttachmentSection } from "@/features/attachments";
import {
	type DetailFieldItem,
	EntityDetail,
} from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import { formatter } from "@/shared/lib/formatter";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useEmployee } from "../../hooks/use-data";

interface EmployeeDetailsProps {
	id: EntityId;
	state: OverlayState;
}

export const EmployeeDetails = ({ id, state }: EmployeeDetailsProps) => {
	const { employee } = useEmployee(id);

	const generalInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "OAB", definition: formatter.oab(employee.oabNumber) },
			{ term: "Cargo", definition: employee.type },
			{ term: "Perfil", definition: employee.role },
			{ term: "Contratos", definition: employee.contractCount },
		],
		[employee],
	);

	const contactInfo = React.useMemo<DetailFieldItem[]>(
		() => [{ term: "Email", definition: employee.email }],
		[employee],
	);

	const financialInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Remuneração",
				definition: formatter.percent(employee.remunerationPercent),
			},
		],
		[employee],
	);

	const registerInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Status",
				definition: (
					<EntityStatus
						isActive={employee.isActive}
						isSoftDeleted={employee.isSoftDeleted}
					/>
				),
			},
			{ term: "Criado em", definition: formatter.date(employee.createdAt) },
		],
		[employee],
	);

	return (
		<EntityDetail state={state} title={employee.fullName}>
			<EntityDetail.Fields items={generalInfo} />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Contato">
				<EntityDetail.Fields items={contactInfo} />
			</EntityDetail.Section>
			<EntityDetail.Separator />
			<EntityDetail.Section title="Financeiro">
				<EntityDetail.Fields items={financialInfo} />
			</EntityDetail.Section>
			<EntityDetail.Separator className="mt-auto" />
			<AttachmentSection
				ownerId={employee.id}
				ownerKind="employee"
				canUpload={!employee.isSoftDeleted}
			/>
			<EntityDetail.Separator />
			<EntityDetail.Section title="Registro">
				<EntityDetail.Fields items={registerInfo} />
			</EntityDetail.Section>
		</EntityDetail>
	);
};
