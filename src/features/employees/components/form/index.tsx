import { useStore } from "@tanstack/react-form-start";
import { Field } from "@/shared/components/ui";
import { useEmployeeForm } from "../../hooks/form";
import { useEmployeeOptions } from "../../hooks/options";
import type { Employee } from "../../schemas/model";
import { defaultFormUpdateValues } from "../../utils/default";

interface EmployeeFormProps {
  mode: "create" | "edit";
  initialEmployee?: Employee;
  onSuccess?: () => void;
}

export const EmployeeForm = ({
  mode,
  initialEmployee,
  onSuccess,
}: EmployeeFormProps) => {
  const initialData = initialEmployee
    ? defaultFormUpdateValues(initialEmployee)
    : undefined;
  const { form, Form, FormField, FormSubmit } = useEmployeeForm({
    mode,
    initialData,
    onSuccess,
  });
  const { roles, types } = useEmployeeOptions();

  const typeValue = useStore(form.store, (state) => state.values.type);
  const isLawyer = typeValue === 1;

  return (
    <Form form={form}>
      <div className="flex flex-col gap-4">
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
              <field.Autocomplete label="Função" options={types} isRequired />
            )}
          </FormField>
          {isLawyer && (
            <FormField name="oabNumber">
              {(field) => (
                <field.Input label="OAB" placeholder="RS000000" maxLength={8} />
              )}
            </FormField>
          )}
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
                formatOptions={{ style: "percent" }}
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
                formatOptions={{ style: "percent" }}
              />
            )}
          </FormField>
        </Field.Group>
        <div className="flex justify-start">
          <FormSubmit />
        </div>
      </div>
    </Form>
  );
};
