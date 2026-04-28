import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { toast } from "@/shared/lib/toast";
import { sessionKeys } from "@/shared/session/api";
import { resetPasswordMutationOptions } from "../api/mutations";
import { passwordResetCompleteInputSchema } from "../schemas/form";

export function usePasswordResetCompleteForm(token: string) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const mutation = useMutation(resetPasswordMutationOptions());

	const form = useAppForm({
		defaultValues: {
			token,
			newPassword: "",
			confirmPassword: "",
		},
		validators: {
			onSubmit: passwordResetCompleteInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				const parsed = passwordResetCompleteInputSchema.parse(value);
				await mutation.mutateAsync({ data: parsed });
				await queryClient.invalidateQueries({
					queryKey: sessionKeys.all,
				});
				toast.success("Senha redefinida com sucesso.");
				await navigate({ to: "/login" });
			} catch (error) {
				toast.danger(
					error instanceof Error
						? error.message
						: "Não foi possível redefinir a senha.",
				);
			}
		},
	});

	return {
		form,
		isPending: mutation.isPending,
	};
}
