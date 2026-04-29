import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { toast } from "@/shared/lib/toast";
import { getSafeInternalRedirectPath } from "@/shared/session";
import {
	getCurrentSessionQueryOptions,
	sessionKeys,
} from "@/shared/session/api";
import { loginMutationOptions } from "../api/mutations";
import { loginInputSchema } from "../schemas/form";

interface UseLoginFormOptions {
	redirectTo?: string;
}

export function useLoginForm({ redirectTo }: UseLoginFormOptions = {}) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const loginMutation = useMutation(loginMutationOptions());

	const form = useAppForm({
		defaultValues: {
			identifier: "",
			password: "",
			rememberMe: false,
		},
		validators: {
			onSubmit: loginInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				const parsed = loginInputSchema.parse(value);
				await loginMutation.mutateAsync({ data: parsed });
				await queryClient.invalidateQueries({
					queryKey: sessionKeys.all,
				});
				const session = await queryClient.fetchQuery(
					getCurrentSessionQueryOptions(),
				);

				if (!session) {
					throw new Error("Sessão autenticada indisponível.");
				}

				await navigate({
					to: getSafeInternalRedirectPath(redirectTo) ?? "/",
				});
			} catch (error) {
				toast.danger(
					error instanceof Error
						? error.message
						: "Não foi possível concluir o login.",
				);
			}
		},
	});

	return {
		form,
		isPending: loginMutation.isPending,
	};
}
