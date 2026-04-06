import { useMutation, useQueryClient } from "@tanstack/react-query";
import { restoreEmployeeOptions } from "../../api/restore";
import { EMPLOYEE_DATA_CACHE_KEY } from "../../constants";
import type { Employee } from "../../schemas/model";
import { toast } from "@/shared/lib/toast";
import { useOverlayState } from "@/shared/hooks/use-overlay-state";
import { DialogConfirm } from "@/shared/components/dialog-confirm";

interface EmployeeRestoreDialogProps {
  employee: Employee;
  onClose: () => void;
}

export const EmployeeRestoreDialog = ({
  employee,
  onClose,
}: EmployeeRestoreDialogProps) => {
  const queryClient = useQueryClient();
  const mutation = useMutation(restoreEmployeeOptions());

  const state = useOverlayState({ defaultOpen: true });

  const handleConfirm = async () => {
    try {
      await mutation.mutateAsync({ data: { id: employee.id } });
      toast.success("Funcionário restaurado com sucesso.");
      queryClient.invalidateQueries({ queryKey: [EMPLOYEE_DATA_CACHE_KEY] });
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ocorreu um erro inesperado";
      toast.danger(message);
    }
  };

  return (
    <DialogConfirm
      title="Restaurar funcionário"
      description={`Deseja restaurar o acesso de ${employee.fullName}?`}
      onConfirm={handleConfirm}
      confirmButtonLabel="Restaurar"
      cancelButtonLabel="Cancelar"
      state={state}
    />
  );
};
