import { FormWrapper } from "@/shared/components/form-wrapper";
import { Field } from "@/shared/components/ui";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { LAWYER_TYPE_VALUE } from "../../constants/values";
import { useEmployeeForm } from "../../hooks/use-form";
import { useEmployeeOptions } from "../../hooks/use-options";

interface EmployeeFormProps {
	id?: EntityId;
	state: OverlayState;
	onSuccess?: () => void;
}

export const EmployeeForm = ({ id, state, onSuccess }: EmployeeFormProps) => {
	const { roles, types } = useEmployeeOptions();
	const { form } = useEmployeeForm({ id, onSuccess });

	const title = id ? "Editar funcionário" : "Novo funcionário";

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
								if (value !== LAWYER_TYPE_VALUE) {
									form.setFieldValue("oabNumber", "");
								}
							},
						}}
					>
						{(field) => (
							<field.Autocomplete
								label="Função"
								options={types}
								variant="secondary"
								isRequired
							/>
						)}
					</form.AppField>
					<form.AppField name="role">
						{(field) => (
							<field.Autocomplete
								label="Cargo"
								options={roles}
								variant="secondary"
								isRequired
							/>
						)}
					</form.AppField>
					<form.Subscribe
						selector={(state) => state.values.type === LAWYER_TYPE_VALUE}
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
											isRequired
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
						{(field) => <field.Checkbox label="Ativo" variant="secondary" />}
					</form.AppField>
				</Field.Group>
			</FormWrapper>
		</form.Form>
	);
};
