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
import type { OverlayState } from "@/shared/types/overlay";
import { getEmployeeByIdQueryOptions } from "../../api/queries";

interface EmployeeDetailsProps {
	id: EntityId;
	state: OverlayState;
}

export const EmployeeDetails = ({ id, state }: EmployeeDetailsProps) => {
	const { data } = useSuspenseQuery(getEmployeeByIdQueryOptions(id));

	const generalInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{ term: "OAB", definition: formatter.oab(data.oabNumber) },
			{ term: "Cargo", definition: data.type },
			{ term: "Perfil", definition: data.role },
			{ term: "Contratos", definition: data.contractCount },
		],
		[data],
	);

	const contactInfo = React.useMemo<DetailFieldItem[]>(
		() => [{ term: "Email", definition: data.email }],
		[data],
	);

	const financialInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Remuneração",
				definition: formatter.percent(data.remunerationPercent),
			},
		],
		[data],
	);

	const registerInfo = React.useMemo<DetailFieldItem[]>(
		() => [
			{
				term: "Status",
				definition: (
					<EntityStatus
						isActive={data.isActive}
						isSoftDeleted={data.isSoftDeleted}
					/>
				),
			},
			{ term: "Criado em", definition: formatter.date(data.createdAt) },
		],
		[data],
	);

	return (
		<EntityDetail state={state} title={data.fullName}>
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
				ownerId={data.id}
				ownerKind="employee"
				canUpload={!data.isSoftDeleted}
			/>
			<EntityDetail.Separator />
			<EntityDetail.Section title="Registro">
				<EntityDetail.Fields items={registerInfo} />
			</EntityDetail.Section>
		</EntityDetail>
	);
};
