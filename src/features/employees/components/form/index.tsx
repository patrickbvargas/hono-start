import { FieldGroup } from "@/shared/components/ui/field";
import {
	Wrapper,
	WrapperBody,
	WrapperFooter,
} from "@/shared/components/wrapper";
import { ROUTES } from "@/shared/config/routes";
import { useEmployeeForm } from "../../hooks/form";
import { useEmployeeOptions } from "../../hooks/options";

export const EmployeeForm = () => {
	const { form, Form, Field, Submit } = useEmployeeForm();
	const { roles, types } = useEmployeeOptions();

	return (
		<Form form={form}>
			<Wrapper title={ROUTES.employee.title}>
				<WrapperBody>
					<FieldGroup className="grid grid-cols-2">
						<Field name="fullName">
							{(field) => <field.Input label="Nome" isRequired />}
						</Field>
						<Field name="email">
							{(field) => <field.Input label="Email" isRequired />}
						</Field>
					</FieldGroup>
					<FieldGroup className="grid grid-cols-3">
						<Field name="type">
							{(field) => (
								<field.Autocomplete label="Função" options={types} isRequired />
							)}
						</Field>
						<Field name="oabNumber">
							{(field) => (
								<field.Input label="OAB" placeholder="RS000000" maxLength={8} />
							)}
						</Field>
						<Field name="role">
							{(field) => (
								<field.Autocomplete label="Perfil" options={roles} isRequired />
							)}
						</Field>
					</FieldGroup>
					<FieldGroup className="grid grid-cols-2 w-1/2">
						<Field name="remunerationPercent">
							{(field) => (
								<field.Number
									label="% Remuneração"
									minValue={0}
									maxValue={1}
									step={0.05}
									isRequired
									formatOptions={{
										style: "percent",
									}}
								/>
							)}
						</Field>
						<Field name="referrerPercent">
							{(field) => (
								<field.Number
									label="% Indicação"
									minValue={0}
									maxValue={1}
									step={0.05}
									isRequired
									formatOptions={{
										style: "percent",
									}}
								/>
							)}
						</Field>
					</FieldGroup>
				</WrapperBody>
				<WrapperFooter className="justify-start">
					<Submit />
				</WrapperFooter>
			</Wrapper>
		</Form>
	);
};
