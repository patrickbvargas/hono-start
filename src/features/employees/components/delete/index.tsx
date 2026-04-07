import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { toast } from "@/shared/lib/toast";
import type { OverlayState } from "@/shared/types/overlay";
import { deleteEmployeeOptions } from "../../api/delete";
import { EMPLOYEE_DATA_CACHE_KEY } from "../../constants";
import type { Employee } from "../../schemas/model";

interface EmployeeDeleteProps {
  employee: Employee;
  state: OverlayState;
  onSuccess?: () => void;
}

export const EmployeeDelete = ({
  employee,
  state,
  onSuccess,
}: EmployeeDeleteProps) => {
  const queryClient = useQueryClient();
  const mutation = useMutation(deleteEmployeeOptions());

  const handleConfirm = async () => {
    try {
      await mutation.mutateAsync({ data: { id: employee.id } });
      toast.success("Funcionário excluído com sucesso.");
      queryClient.invalidateQueries({ queryKey: [EMPLOYEE_DATA_CACHE_KEY] });
      onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ocorreu um erro inesperado";
      toast.danger(message);
    }
  };

  return (
    <ConfirmDialog
      title="Excluir funcionário"
      description={`Tem certeza que deseja excluir ${employee.fullName}? Esta ação pode ser desfeita restaurando o funcionário.`}
      onConfirm={handleConfirm}
      confirmButtonLabel="Excluir"
      variant="danger"
      isPending={mutation.isPending}
      state={state}
    />
  );
};
