import { FormWrapper } from "@/shared/components/form-wrapper";
import { Field } from "@/shared/components/ui";
import type { OverlayState } from "@/shared/types/overlay";
import { useEmployeeForm } from "../../hooks/use-form";
import { useEmployeeOptions } from "../../hooks/use-options";
import type { Employee } from "../../schemas/model";
import {
	ADMIN_TYPE_VALUE,
	type EmployeeRole,
	type EmployeeType,
	LAWYER_TYPE_VALUE,
} from "../../schemas/option";
import { defaultFormUpdateValues } from "../../utils/default";

function getIsLawyer(types: EmployeeType[], typeValue: unknown) {
	return types.find((t) => t.id === Number(typeValue))?.isLawyer ?? false;
}

function getMergedTypeOptions(
	types: EmployeeType[],
	employee?: Employee,
): EmployeeType[] {
	if (!employee || types.some((type) => type.id === employee.typeId)) {
		return types;
	}

	return [
		...types,
		{
			id: employee.typeId,
			label: `${employee.type} (inativo)`,
			value: employee.typeValue,
			isDisabled: true,
			isLawyer: employee.typeValue === LAWYER_TYPE_VALUE,
		},
	];
}

function getMergedRoleOptions(
	roles: EmployeeRole[],
	employee?: Employee,
): EmployeeRole[] {
	if (!employee || roles.some((role) => role.id === employee.roleId)) {
		return roles;
	}

	return [
		...roles,
		{
			id: employee.roleId,
			label: `${employee.role} (inativo)`,
			value: employee.roleValue,
			isDisabled: true,
			isAdmin: employee.roleValue === ADMIN_TYPE_VALUE,
		},
	];
}

interface EmployeeFormProps {
	employee?: Employee;
	state: OverlayState;
	onSuccess?: () => void;
}

export const EmployeeForm = ({
	employee,
	state,
	onSuccess,
}: EmployeeFormProps) => {
	const { roles, types } = useEmployeeOptions();
	const typeOptions = getMergedTypeOptions(types, employee);
	const roleOptions = getMergedRoleOptions(roles, employee);
	const { form } = useEmployeeForm({
		initialData: employee && defaultFormUpdateValues(employee),
		onSuccess,
		roles: roleOptions,
		types: typeOptions,
	});

	const title = employee ? "Editar funcionário" : "Novo funcionário";

	return (
		<form.Form form={form}>
			<FormWrapper state={state} title={title} footer={<form.Submit />}>
				<Field.Group>
					<form.AppField name="fullName">
						{(field) => (
							<field.Input label="Nome" variant="secondary" isRequired />
						)}
					</form.AppField>
					<form.AppField name="email">
						{(field) => (
							<field.Input label="Email" variant="secondary" isRequired />
						)}
					</form.AppField>
				</Field.Group>
				<Field.Group className="grid-cols-2">
					<form.AppField
						name="type"
						listeners={{
							onChange: ({ value }) => {
								if (!getIsLawyer(typeOptions, value))
									form.setFieldValue("oabNumber", ""); // clear OAB when not lawyer
							},
						}}
					>
						{(field) => (
							<field.Autocomplete
								label="Função"
								options={typeOptions}
								variant="secondary"
								isRequired
							/>
						)}
					</form.AppField>
					<form.AppField name="role">
						{(field) => (
							<field.Autocomplete
								label="Perfil"
								options={roleOptions}
								variant="secondary"
								isRequired
							/>
						)}
					</form.AppField>
					<form.Subscribe
						selector={(state) => getIsLawyer(typeOptions, state.values.type)}
					>
						{(isLawyer) =>
							isLawyer && (
								<form.AppField name="oabNumber">
									{(field) => (
										<field.Input
											label="OAB"
											placeholder="RS000000"
											variant="secondary"
											maxLength={8}
										/>
									)}
								</form.AppField>
							)
						}
					</form.Subscribe>
				</Field.Group>
				<Field.Group className="grid-cols-2">
					<form.AppField name="remunerationPercent">
						{(field) => (
							<field.Number
								label="% Remuneração"
								minValue={0}
								maxValue={1}
								step={0.05}
								variant="secondary"
								isRequired
								fullWidth
								formatOptions={{ style: "percent" }}
							/>
						)}
					</form.AppField>
					<form.AppField name="referrerPercent">
						{(field) => (
							<field.Number
								label="% Indicação"
								minValue={0}
								maxValue={1}
								step={0.05}
								variant="secondary"
								isRequired
								fullWidth
								formatOptions={{ style: "percent" }}
							/>
						)}
					</form.AppField>
				</Field.Group>
				<Field.Group>
					<form.AppField name="isActive">
						{(field) => <field.Checkbox label="Ativo" />}
					</form.AppField>
				</Field.Group>
			</FormWrapper>
		</form.Form>
	);
};
