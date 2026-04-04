import { Field } from "@/shared/components/ui";
import {
	Wrapper,
	WrapperBody,
	WrapperFooter,
} from "@/shared/components/wrapper";
import { ROUTES } from "@/shared/config/routes";
import { useEmployeeForm } from "../../hooks/form";
import { useEmployeeOptions } from "../../hooks/options";

// TODO: refatorar
export const EmployeeForm = () => {
	const { form, Form, FormField, FormSubmit } = useEmployeeForm({
		mode: "create",
	});
	const { roles, types } = useEmployeeOptions();

	return (
		<Form form={form}>
			<Wrapper title={ROUTES.employee.title}>
				<WrapperBody>
					<Field.Group className="grid grid-cols-2">
						<FormField name="fullName">
							{(field) => <field.Input label="Nome" isRequired />}
						</FormField>
						<FormField name="email">
							{(field) => <field.Input label="Email" isRequired />}
						</FormField>
					</Field.Group>
					<Field.Group className="grid grid-cols-3">
						<FormField name="type">
							{(field) => (
								<field.Autocomplete label="Função" options={types} isRequired />
							)}
						</FormField>
						<FormField name="oabNumber">
							{(field) => (
								<field.Input label="OAB" placeholder="RS000000" maxLength={8} />
							)}
						</FormField>
						<FormField name="role">
							{(field) => (
								<field.Autocomplete label="Perfil" options={roles} isRequired />
							)}
						</FormField>
					</Field.Group>
					<Field.Group className="grid grid-cols-2 w-1/2">
						<FormField name="remunerationPercent">
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
						</FormField>
						<FormField name="referrerPercent">
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
						</FormField>
					</Field.Group>
				</WrapperBody>
				<WrapperFooter className="justify-start">
					<FormSubmit />
				</WrapperFooter>
			</Wrapper>
		</Form>
	);
};
