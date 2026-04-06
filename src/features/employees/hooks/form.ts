import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { createEmployeeOptions } from "../api/create";
import { updateEmployeeOptions } from "../api/update";
import { EMPLOYEE_DATA_CACHE_KEY } from "../constants";
import type { EmployeeCreate, EmployeeUpdate } from "../schemas/form";
import { employeeCreateSchema, employeeUpdateSchema } from "../schemas/form";
import { defaultFormCreateValues } from "../utils/default";
import { toast } from "@/shared/lib/toast";

interface UseEmployeeFormOptions {
  mode: "create" | "edit";
  initialData?: EmployeeUpdate;
  onSuccess?: () => void;
}

export function useEmployeeForm({
  mode,
  initialData,
  onSuccess,
}: UseEmployeeFormOptions) {
  const queryClient = useQueryClient();
  const createMutation = useMutation(createEmployeeOptions());
  const updateMutation = useMutation(updateEmployeeOptions());

  const form = useAppForm({
    defaultValues: initialData ?? defaultFormCreateValues(),
    validators: {
      onSubmit: mode === "create" ? employeeCreateSchema : employeeUpdateSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        if (mode === "create") {
          await createMutation.mutateAsync({ data: value as EmployeeCreate });
          toast.success("Funcionário criado com sucesso.");
        } else {
          await updateMutation.mutateAsync({ data: value as EmployeeUpdate });
          toast.success("Funcionário atualizado com sucesso.");
        }
        queryClient.invalidateQueries({ queryKey: [EMPLOYEE_DATA_CACHE_KEY] });
        onSuccess?.();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Ocorreu um erro inesperado";
        toast.danger(message);
      }
    },
  });

  return {
    form,
    mutation: mode === "create" ? createMutation : updateMutation,
    Form: form.Form,
    FormField: form.AppField,
    FormSubmit: form.Submit,
    FormReset: form.Reset,
  };
}
