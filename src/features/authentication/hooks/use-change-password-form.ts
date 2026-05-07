import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { toast } from "@/shared/lib/toast";
import { sessionKeys } from "@/shared/session/api";
import { changePasswordMutationOptions } from "../api/mutations";
import { AUTHENTICATION_ERRORS } from "../constants/errors";
import { changePasswordInputSchema } from "../schemas/form";

interface UseChangePasswordFormOptions {
	onSuccess?: () => void;
}

export function useChangePasswordForm({
	onSuccess,
}: UseChangePasswordFormOptions = {}) {
	const queryClient = useQueryClient();
	const mutation = useMutation(changePasswordMutationOptions());

	const form = useAppForm({
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
			revokeOtherSessions: true,
		},
		validators: {
			onSubmit: changePasswordInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				const parsed = changePasswordInputSchema.parse(value);
				await mutation.mutateAsync({ data: parsed });
				await queryClient.invalidateQueries({
					queryKey: sessionKeys.all,
				});
				toast.success("Senha alterada com sucesso.");
				form.reset();
				onSuccess?.();
			} catch (error) {
				toast.danger(
					error instanceof Error
						? error.message
						: AUTHENTICATION_ERRORS.CHANGE_PASSWORD_FAILED,
				);
			}
		},
	});

	return {
		form,
		isPending: mutation.isPending,
	};
}
