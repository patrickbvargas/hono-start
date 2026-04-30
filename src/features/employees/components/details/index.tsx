import * as React from "react";
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
	return (
		<EntityDetail.Root key={id} state={state}>
			<React.Suspense fallback={<EmployeeDetailsFallback />}>
				<EmployeeDetailsContent id={id} />
			</React.Suspense>
		</EntityDetail.Root>
	);
};

const EmployeeDetailsContent = ({ id }: { id: EntityId }) => {
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
		<EntityDetail.Content>
			<EntityDetail.Header>
				<EntityDetail.Title>{employee.fullName}</EntityDetail.Title>
			</EntityDetail.Header>
			<EntityDetail.Body>
				<EntityDetail.Fields items={generalInfo} />
				<EntityDetail.Separator />
				<EntityDetail.Section title="Contato">
					<EntityDetail.Fields items={contactInfo} />
				</EntityDetail.Section>
				<EntityDetail.Separator />
				<EntityDetail.Section title="Financeiro">
					<EntityDetail.Fields items={financialInfo} />
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

const EmployeeDetailsFallback = () => (
	<EntityDetail.Content>
		<EntityDetail.Header>
			<EntityDetail.Title>
				<EntityDetail.SkeletonTitle />
			</EntityDetail.Title>
		</EntityDetail.Header>
		<EntityDetail.Body>
			<EntityDetail.SkeletonFields rows={4} />
			<EntityDetail.Separator />
			<EntityDetail.Section title="Contato">
				<EntityDetail.SkeletonFields rows={1} />
			</EntityDetail.Section>
			<EntityDetail.Separator />
			<EntityDetail.Section title="Financeiro">
				<EntityDetail.SkeletonFields rows={1} />
			</EntityDetail.Section>
			<EntityDetail.Separator />
			<EntityDetail.Section title="Registro">
				<EntityDetail.SkeletonFields rows={2} />
			</EntityDetail.Section>
		</EntityDetail.Body>
		<EntityDetail.Footer />
	</EntityDetail.Content>
);
