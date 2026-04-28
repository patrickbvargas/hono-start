import { useMutation } from "@tanstack/react-query";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { toast } from "@/shared/lib/toast";
import { requestPasswordResetMutationOptions } from "../api/mutations";
import { passwordResetRequestInputSchema } from "../schemas/form";

const SAFE_RESET_MESSAGE =
	"Se a conta existir, você receberá um link de redefinição de senha.";

export function usePasswordResetRequestForm() {
	const mutation = useMutation(requestPasswordResetMutationOptions());

	const form = useAppForm({
		defaultValues: {
			identifier: "",
		},
		validators: {
			onSubmit: passwordResetRequestInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				const parsed = passwordResetRequestInputSchema.parse(value);
				await mutation.mutateAsync({ data: parsed });
				toast.success(SAFE_RESET_MESSAGE);
				form.reset();
			} catch (error) {
				toast.danger(
					error instanceof Error ? error.message : SAFE_RESET_MESSAGE,
				);
			}
		},
	});

	return {
		form,
		isPending: mutation.isPending,
	};
}
