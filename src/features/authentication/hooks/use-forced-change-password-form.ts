import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { toast } from "@/shared/lib/toast";
import { forcedChangePasswordMutationOptions } from "../api/mutations";
import { AUTHENTICATION_ERRORS } from "../constants/errors";
import { forcedChangePasswordInputSchema } from "../schemas/form";
import { defaultForcedChangePasswordValues } from "../utils/default";

export function useForcedChangePasswordForm() {
	const queryClient = useQueryClient();
	const mutation = useMutation(forcedChangePasswordMutationOptions());

	const form = useAppForm({
		defaultValues: defaultForcedChangePasswordValues(),
		validators: {
			onSubmit: forcedChangePasswordInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				const parsed = forcedChangePasswordInputSchema.parse(value);
				await mutation.mutateAsync({ data: parsed });
				toast.success("Senha alterada com sucesso.");
				form.reset(defaultForcedChangePasswordValues());
				queryClient.clear();
				window.location.replace("/");
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
