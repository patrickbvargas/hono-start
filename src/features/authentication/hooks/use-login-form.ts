import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { toast } from "@/shared/lib/toast";
import { getCurrentSessionQueryOptions } from "@/shared/session/api";
import { clearAuthenticatedQueryCache } from "@/shared/session/cache";
import {
	FORCED_PASSWORD_CHANGE_PATH,
	getSafeInternalRedirectPath,
} from "@/shared/session/route";
import { loginMutationOptions } from "../api/mutations";
import { loginInputSchema } from "../schemas/form";
import { defaultLoginValues } from "../utils/default";

interface UseLoginFormOptions {
	redirectTo?: string;
}

export function useLoginForm({ redirectTo }: UseLoginFormOptions = {}) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const loginMutation = useMutation(loginMutationOptions());

	const form = useAppForm({
		defaultValues: defaultLoginValues(),
		validators: {
			onSubmit: loginInputSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				const parsed = loginInputSchema.parse(value);
				await loginMutation.mutateAsync({ data: parsed });
				clearAuthenticatedQueryCache(queryClient);
				const session = await queryClient.fetchQuery(
					getCurrentSessionQueryOptions(),
				);

				if (!session) {
					throw new Error("Sessão autenticada indisponível.");
				}

				await navigate({
					to: session.mustChangePassword
						? FORCED_PASSWORD_CHANGE_PATH
						: (getSafeInternalRedirectPath(redirectTo) ?? "/"),
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
