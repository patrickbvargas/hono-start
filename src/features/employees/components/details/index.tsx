import * as React from "react";
import {
	Detail,
	type DetailFieldItem,
} from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import { formatter } from "@/shared/lib/formatter";
import type { OverlayState } from "@/shared/types/overlay";
import type { Employee } from "../../schemas/model";

interface EmployeeDetailsProps {
	employee: Employee;
	state: OverlayState;
}

export const EmployeeDetails = ({ employee, state }: EmployeeDetailsProps) => {
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
		<Detail state={state} title={employee.fullName}>
			<Detail.Fields items={generalInfo} />
			<Detail.Separator />
			<Detail.Section title="Contato">
				<Detail.Fields items={contactInfo} />
			</Detail.Section>
			<Detail.Separator />
			<Detail.Section title="Financeiro">
				<Detail.Fields items={financialInfo} />
			</Detail.Section>
			<Detail.Separator className="mt-auto" />
			<Detail.Section title="Registro">
				<Detail.Fields items={registerInfo} />
			</Detail.Section>
		</Detail>
	);
};
